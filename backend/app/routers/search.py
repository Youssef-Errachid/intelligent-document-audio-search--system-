import re
pp/routers/documents.py
from typing import Literal
pp/routers/documents.py

pp/routers/documents.py
from fastapi import APIRouter, HTTPException, Query
pp/routers/documents.py

pp/routers/documents.py
from app.database import database
pp/routers/documents.py
from app.schemas import SearchResponse, SearchResult
pp/routers/documents.py

pp/routers/documents.py
router = APIRouter(tags=["search"])
pp/routers/documents.py

pp/routers/documents.py
SNIPPET_SIZE = 80
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
def make_snippet(text: str, match: re.Match) -> str:
pp/routers/documents.py
    start = max(match.start() - SNIPPET_SIZE, 0)
pp/routers/documents.py
    end = min(match.end() + SNIPPET_SIZE, len(text))
pp/routers/documents.py
    prefix = "..." if start > 0 else ""
pp/routers/documents.py
    suffix = "..." if end < len(text) else ""
pp/routers/documents.py
    return prefix + text[start:end] + suffix
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
@router.get("/search", response_model=SearchResponse)
pp/routers/documents.py
async def search(
pp/routers/documents.py
    q: str = Query(min_length=2),
pp/routers/documents.py
    mode: Literal["keyword", "semantic", "hybrid"] = "keyword",
pp/routers/documents.py
    limit: int = Query(default=10, ge=1, le=50),
pp/routers/documents.py
):
pp/routers/documents.py
    if mode != "keyword":
pp/routers/documents.py
        raise HTTPException(status_code=501, detail=f"mode '{mode}' is not implemented yet")
pp/routers/documents.py

pp/routers/documents.py
    escaped = re.escape(q)
pp/routers/documents.py
    pattern = re.compile(escaped, re.IGNORECASE)
pp/routers/documents.py

pp/routers/documents.py
    cursor = database["documents"].find(
pp/routers/documents.py
        {"text": {"$regex": escaped, "$options": "i"}}
pp/routers/documents.py
    ).limit(limit)
pp/routers/documents.py

pp/routers/documents.py
    results = []
pp/routers/documents.py
    async for doc in cursor:
pp/routers/documents.py
        match = pattern.search(doc["text"])
pp/routers/documents.py
        if match is None:
pp/routers/documents.py
            continue
pp/routers/documents.py

pp/routers/documents.py
        start = end = None
pp/routers/documents.py
        if doc["type"] == "audio":
pp/routers/documents.py
            for segment in doc.get("segments", []):
pp/routers/documents.py
                if pattern.search(segment["text"]):
pp/routers/documents.py
                    start, end = segment["start"], segment["end"]
pp/routers/documents.py
                    break
pp/routers/documents.py

pp/routers/documents.py
        results.append(
pp/routers/documents.py
            SearchResult(
pp/routers/documents.py
                id=str(doc["_id"]),
pp/routers/documents.py
                source_path=doc["source_path"],
pp/routers/documents.py
                type=doc["type"],
pp/routers/documents.py
                snippet=make_snippet(doc["text"], match),
pp/routers/documents.py
                start=start,
pp/routers/documents.py
                end=end,
pp/routers/documents.py
            )
pp/routers/documents.py
        )
pp/routers/documents.py

pp/routers/documents.py
    return SearchResponse(query=q, mode=mode, results=results)
pp/routers/documents.py
