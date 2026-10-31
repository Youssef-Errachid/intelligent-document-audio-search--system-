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


class DocumentSummary(BaseModel):
    id: str
    source_path: str
    type: str
    language: str | None = None
    status: str | None = None
    preview: str


class DocumentListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: list[DocumentSummary]


class UploadResponse(BaseModel):
    id: str
    source_path: str
    type: str
    status: str
    duplicate: bool = False
    characters: int | None = None
