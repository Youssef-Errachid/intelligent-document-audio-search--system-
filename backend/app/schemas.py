from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    name: str = Field(min_length=1, max_length=100)

    @field_validator("password")
    @classmethod
    def password_byte_length(cls, value: str) -> str:
        # bcrypt refuses passwords longer than 72 bytes (UTF-8, not characters)
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

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