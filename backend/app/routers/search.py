import logging
import unicodedata
from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from app.indexation.embedding_service import EmbeddingError, embed
from app.indexation.solr_service import SolrError, search_chunks, search_vectors
from app.schemas import SearchResponse, SearchResult

logger = logging.getLogger(__name__)
router = APIRouter(tags=["search"])

SNIPPET_SIZE = 80

RRF_K = 60

HYBRID_CANDIDATES_PER_RESULT = 3


def as_text(value) -> str:
    """Solr may return a text field as a list of strings."""
    if isinstance(value, list):
        return " ".join(value)
    return value or ""


def fold(text: str) -> str:
    """Lowercase and remove accents, keeping exactly one character per input character.


    "Requêtes" -> "requetes". Same length as the input, so positions stay valid.
    """
    return "".join(unicodedata.normalize("NFD", char.lower())[0] for char in text)


def make_snippet(text: str, query: str) -> str:
    """Cut a short piece of text around the first query word found (accents ignored).

    With semantic search the words may be absent: then we show the start of the chunk.
    """
    folded_text = fold(text)
    positions = []
    for word in query.split():
        position = folded_text.find(fold(word))
        if position != -1:
            positions.append(position)

    center = min(positions) if positions else 0
    start = max(center - SNIPPET_SIZE, 0)
    end = min(center + SNIPPET_SIZE * 2, len(text))
    prefix = "..." if start > 0 else ""
    suffix = "..." if end < len(text) else ""
    return prefix + text[start:end] + suffix


def to_results(chunks: list[dict], query: str) -> list[SearchResult]:
    """Turn Solr chunks into the API search results."""
    results = []
    for chunk in chunks:
        content = as_text(chunk.get("content"))
        results.append(

            SearchResult(
                id=chunk["doc_id"],
                source_path=chunk["source_path"],
                type=chunk["doc_type"],
                snippet=make_snippet(content, query),
                start=chunk.get("start_time"),
                end=chunk.get("end_time"),
                score=chunk.get("score"),
            )
        )
    return results


def fuse(rankings: list[list[dict]], limit: int) -> list[dict]:
    """Reciprocal Rank Fusion: merge rankings using positions, not scores.

    Each document gets 1 / (RRF_K + rank) for every list it appears in.
    The chunk kept for a document is the one of the first list it appears in.
    """
    scores = {}
    chunks = {}
    for ranking in rankings:
        for rank, chunk in enumerate(ranking, start=1):
            doc_id = chunk["doc_id"]
            scores[doc_id] = scores.get(doc_id, 0.0) + 1 / (RRF_K + rank)
            chunks.setdefault(doc_id, chunk)

    best = sorted(scores, key=scores.get, reverse=True)[:limit]
    return [{**chunks[doc_id], "score": scores[doc_id]} for doc_id in best]


async def hybrid_search(query: str, limit: int) -> tuple[list[dict], str]:

    """Keyword and semantic search merged with RRF. Returns (chunks, mode used).

    If Ollama is down, we fall back to keyword search and say so in the mode.
    """
    candidates = limit * HYBRID_CANDIDATES_PER_RESULT
    keyword_chunks = await search_chunks(query, candidates)

    try:
        [vector] = await embed([query])
    except EmbeddingError:
        logger.warning("Ollama is unavailable, hybrid search falls back to keyword search")
        return keyword_chunks[:limit], "keyword"

    semantic_chunks = await search_vectors(vector, candidates)
    # Keyword first: when a document is in both lists, its keyword chunk
    # (which contains the query words) gives a better snippet.
    return fuse([keyword_chunks, semantic_chunks], limit), "hybrid"


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(min_length=2),
    mode: Literal["keyword", "semantic", "hybrid"] = "keyword",
    limit: int = Query(default=10, ge=1, le=50),
):
    try:
        if mode == "keyword":
            chunks = await search_chunks(q, limit)
        elif mode == "semantic":
            [vector] = await embed([q])
            chunks = await search_vectors(vector, limit)
        else:

            chunks, mode = await hybrid_search(q, limit)
    except EmbeddingError as exc:
        logger.exception("Embedding failed: %s", exc)
        raise HTTPException(status_code=503, detail="Semantic search is unavailable.") from exc
    except SolrError as exc:
        logger.exception("Solr search failed: %s", exc)
        raise HTTPException(status_code=503, detail="Search service is unavailable.") from exc

    return SearchResponse(query=q, mode=mode, results=to_results(chunks, q))