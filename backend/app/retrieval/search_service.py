import logging

from app.indexation.embedding_service import EmbeddingError, embed
from app.indexation.solr_service import search_chunks, search_vectors

logger = logging.getLogger(__name__)

RRF_K = 60

HYBRID_CANDIDATES_PER_RESULT = 3


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
    return fuse([keyword_chunks, semantic_chunks], limit), "hybrid"