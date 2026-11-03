from datetime import datetime, timezone

from app.database import database
from app.indexation.chunker import chunk_document
from app.indexation.solr_service import add_documents, commit_changes, delete_by_doc_id


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
        # Drop empty values (e.g. language=None, no start_time for documents)
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
    """Index every document of MongoDB. Returns (documents, chunks)."""
    documents = 0
    chunks = 0

    async for doc in database["documents"].find({}):
        chunks += await index_document(doc, commit=False)
        documents += 1

    await commit_changes()
    return documents, chunks