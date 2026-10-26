from pydantic import BaseModel


class SearchResult(BaseModel):
    id: str
    source_path: str
    type: str
    snippet: str
    start: float | None = None
    end: float | None = None


class SearchResponse(BaseModel):
    query: str
    mode: str
    results: list[SearchResult]