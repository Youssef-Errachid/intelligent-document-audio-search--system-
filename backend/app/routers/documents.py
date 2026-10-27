from typing import Literal

from fastapi import APIRouter, Query

from app.database import database
from app.schemas import DocumentListResponse, DocumentSummary

router = APIRouter(tags=["documents"])

PREVIEW_SIZE = 150


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    doc_type: Literal["pdf", "docx", "csv", "xml", "audio"] | None = Query(
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