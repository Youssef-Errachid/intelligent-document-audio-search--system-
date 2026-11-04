import logging
from datetime import datetime, timezone

from app.database import database
from app.indexation.chunker import chunk_document
from app.indexation.solr_service import (
    add_documents,
    commit_changes,
    delete_all,
    delete_by_doc_id,
)

logger = logging.getLogger(__name__)

BATCH_SIZE = 200


def build_solr_docs(doc: dict) -> list[dict]:
    """Turn one MongoDB document into the list of Solr documents (one per chunk)."""
    doc_id = str(doc["_id"])
    solr_docs = []

    for chunk in chunk_document(doc):
        solr_doc = {
            "id": f"{doc_id}_{chunk['chunk_index']}",
            "doc_id": doc_id,
            "source_path": doc.get("source_path"),
            "doc_type": doc.get("type"),
            "language": doc.get("language"),
            **chunk,
        }

        solr_docs.append({key: value for key, value in solr_doc.items() if value is not None})

    return solr_docs


async def index_document(doc: dict, commit: bool = True) -> int:
    """Replace the chunks of one document in Solr. Returns the number of chunks."""
    doc_id = str(doc["_id"])
    solr_docs = build_solr_docs(doc)

    await delete_by_doc_id(doc_id)
    await add_documents(solr_docs, commit=commit)

    await database["documents"].update_one(
        {"_id": doc["_id"]},
        {"$set": {"status": "indexe", "indexed_at": datetime.now(timezone.utc)}},
    )
    return len(solr_docs)


async def index_all() -> tuple[int, int]:
    """Rebuild the whole Solr index from MongoDB. Returns (documents, chunks).

    We delete everything once, add the chunks in batches, then commit once.
    Mixing a delete-by-query with uncommitted adds for every document is very
    slow in Solr (measured: about 4 minutes for 28 documents).
    """
    await delete_all(commit=True)

    doc_ids = []
    batch = []

    chunks = 0

    async for doc in database["documents"].find({}):
        solr_docs = build_solr_docs(doc)
        batch.extend(solr_docs)
        chunks += len(solr_docs)
        doc_ids.append(doc["_id"])

        if len(batch) >= BATCH_SIZE:
            await add_documents(batch)
            batch = []

    await add_documents(batch)
    await commit_changes()

    await database["documents"].update_many(
        {"_id": {"$in": doc_ids}},
        {"$set": {"status": "indexe", "indexed_at": datetime.now(timezone.utc)}},
    )
    return len(doc_ids), chunks


async def try_index_document(doc: dict) -> str:
    """Index a freshly uploaded document without ever failing the upload.

    Returns the document status: "indexe" on success, the old status otherwise.
    """
    try:
        await index_document(doc)
        return "indexe"
    except Exception:
        logger.exception("Indexing failed for document %s", doc.get("_id"))

        return doc.get("status", "extrait")