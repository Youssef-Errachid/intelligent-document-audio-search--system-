import re
from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from app.database import database
from app.schemas import SearchResponse, SearchResult

router = APIRouter(tags=["search"])

SNIPPET_SIZE = 80


def make_snippet(text: str, match: re.Match) -> str:
    start = max(match.start() - SNIPPET_SIZE, 0)
    end = min(match.end() + SNIPPET_SIZE, len(text))
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

    escaped = re.escape(q)
    pattern = re.compile(escaped, re.IGNORECASE)

    cursor = database["documents"].find(
        {"text": {"$regex": escaped, "$options": "i"}}
    ).limit(limit)

    results = []
    async for doc in cursor:
        match = pattern.search(doc["text"])
        if match is None:
            continue

        start = end = None
        if doc["type"] == "audio":
            for segment in doc.get("segments", []):
                if pattern.search(segment["text"]):
                    start, end = segment["start"], segment["end"]
                    break

        results.append(
            SearchResult(
                id=str(doc["_id"]),
                source_path=doc["source_path"],
                type=doc["type"],
                snippet=make_snippet(doc["text"], match),
                start=start,
                end=end,
            )
        )

    return SearchResponse(query=q, mode=mode, results=results)