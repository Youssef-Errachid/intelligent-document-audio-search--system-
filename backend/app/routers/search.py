import logging
import re
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


def make_snippet(text: str, query: str) -> str:
    """Cut a short piece of text around the first query word found."""
    positions = []
    for word in query.split():
        match = re.search(re.escape(word), text, re.IGNORECASE)
        if match:
            positions.append(match.start())

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