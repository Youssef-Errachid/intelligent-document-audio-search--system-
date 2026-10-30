from pydantic import BaseModel
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
class SearchResult(BaseModel):
pp/routers/documents.py
    id: str
pp/routers/documents.py
    source_path: str
pp/routers/documents.py
    type: str
pp/routers/documents.py
    snippet: str
pp/routers/documents.py
    start: float | None = None
pp/routers/documents.py
    end: float | None = None
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
class SearchResponse(BaseModel):
pp/routers/documents.py
    query: str
pp/routers/documents.py
    mode: str
pp/routers/documents.py
    results: list[SearchResult]
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
class DocumentSummary(BaseModel):
pp/routers/documents.py
    id: str
pp/routers/documents.py
    source_path: str
pp/routers/documents.py
    type: str
pp/routers/documents.py
    language: str | None = None
pp/routers/documents.py
    status: str | None = None
pp/routers/documents.py
    preview: str
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
class DocumentListResponse(BaseModel):
pp/routers/documents.py
    total: int
pp/routers/documents.py
    skip: int
pp/routers/documents.py
    limit: int
pp/routers/documents.py
    items: list[DocumentSummary]
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
class UploadResponse(BaseModel):
pp/routers/documents.py
    id: str
pp/routers/documents.py
    source_path: str
pp/routers/documents.py
    type: str
pp/routers/documents.py
    status: str
pp/routers/documents.py
    duplicate: bool = False
pp/routers/documents.py
    characters: int | None = None
pp/routers/documents.py
