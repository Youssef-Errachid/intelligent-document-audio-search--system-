import logging
import unicodedata
from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from app.indexation.solr_service import SolrError, search_chunks
from app.schemas import SearchResponse, SearchResult

logger = logging.getLogger(__name__)
router = APIRouter(tags=["search"])

SNIPPET_SIZE = 80


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
    """Cut a short piece of text around the first query word found (accents ignored)."""

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


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(min_length=2),
    mode: Literal["keyword", "semantic", "hybrid"] = "keyword",
    limit: int = Query(default=10, ge=1, le=50),
):
    if mode != "keyword":
        raise HTTPException(status_code=501, detail=f"mode '{mode}' is not implemented yet")

    try:
        chunks = await search_chunks(q, limit)
    except SolrError as exc:
        logger.exception("Solr search failed: %s", exc)
        raise HTTPException(status_code=503, detail="Search service is unavailable.") from exc

    results = []
    for chunk in chunks:

        content = as_text(chunk.get("content"))
        results.append(
            SearchResult(
                id=chunk["doc_id"],
                source_path=chunk["source_path"],
                type=chunk["doc_type"],
                snippet=make_snippet(content, q),
                start=chunk.get("start_time"),
                end=chunk.get("end_time"),
                score=chunk.get("score"),
            )
        )

    return SearchResponse(query=q, mode=mode, results=results)