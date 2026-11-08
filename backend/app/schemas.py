from pydantic import BaseModel, Field

class SearchResult(BaseModel):
    id: str
    source_path: str
    type: str
    snippet: str
    start: float | None = None
    end: float | None = None
    score: float | None = None


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

class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


class Source(BaseModel):
    number: int
    id: str
    source_path: str
    type: str
    start: float | None = None
    end: float | None = None
    excerpt: str


class AskResponse(BaseModel):
    answer: str
    mode: str
    sources: list[Source]