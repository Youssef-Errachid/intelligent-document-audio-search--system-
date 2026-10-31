import os
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, File, HTTPException, Query, Response, UploadFile

from app.database import database
from app.schemas import DocumentListResponse, DocumentSummary, UploadResponse
from app.extraction.hash_service import sha256_bytes, sha256_text
from app.extraction.documents.tika_service import TikaError, extract_text

router = APIRouter(tags=["documents"])

PREVIEW_SIZE = 150
ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "csv", "xml"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    doc_type: Literal["pdf", "docx", "txt", "csv", "xml", "audio"] | None = Query(
        default=None, alias="type"
    ),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    collection = database["documents"]
    query = {"type": doc_type} if doc_type else {}

    total = await collection.count_documents(query)

    cursor = (
        collection.find(
            query,
            {
                "source_path": 1,
                "type": 1,
                "language": 1,
                "status": 1,
                "preview": {"$substrCP": ["$text", 0, PREVIEW_SIZE]},
            },
        )
        .sort("_id", -1)
        .skip(skip)
        .limit(limit)
    )

    items = []
    async for doc in cursor:
        items.append(
            DocumentSummary(
                id=str(doc["_id"]),
                source_path=doc["source_path"],
                type=doc["type"],
                language=doc.get("language"),
                status=doc.get("status"),
                preview=doc.get("preview", ""),
            )
        )

    return DocumentListResponse(total=total, skip=skip, limit=limit, items=items)


def duplicate_response(doc: dict) -> UploadResponse:
    return UploadResponse(
        id=str(doc["_id"]),
        source_path=doc["source_path"],
        type=doc["type"],
        status=doc.get("status", "extrait"),
        duplicate=True,
    )


@router.post("/documents", response_model=UploadResponse, status_code=201)
async def upload_document(response: Response, file: UploadFile = File(...)):
    filename = os.path.basename(file.filename or "")
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file format. Use PDF, DOCX, TXT, CSV or XML.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The file is empty.")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="The file is larger than 50 MB.")

    collection = database["documents"]
    projection = {"source_path": 1, "type": 1, "status": 1}

    file_hash = sha256_bytes(content)
    existing = await collection.find_one({"hash.file": file_hash}, projection)
    if existing:
        response.status_code = 200
        return duplicate_response(existing)

    try:
        extracted = await extract_text(content)
    except TikaError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    text = extracted["text"]
    if not text:
        raise HTTPException(status_code=422, detail="No text could be extracted from this file.")

    text_hash = sha256_text(text)
    existing = await collection.find_one({"hash.text": text_hash}, projection)
    if existing:
        response.status_code = 200
        return duplicate_response(existing)

    document = {
        "source_path": filename,
        "type": extension,
        "hash": {"file": file_hash, "text": text_hash},
        "text": text,
        "language": None,
        "metadata": {
            **extracted["metadata"],
            "mime_type": extracted["mime_type"],
            "size_bytes": len(content),
            "origin": "upload",
        },
        "segments": [],
        "status": "extrait",
        "created_at": datetime.now(timezone.utc),
    }
    result = await collection.insert_one(document)

    return UploadResponse(
        id=str(result.inserted_id),
        source_path=filename,
        type=extension,
        status="extrait",
        characters=len(text),
    )