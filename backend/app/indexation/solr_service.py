import httpx

from app.config import settings

# Fields we want in the Solr "documents" core.
FIELDS = [
    {"name": "doc_id", "type": "string"},
    {"name": "source_path", "type": "string"},
    {"name": "doc_type", "type": "string"},
    {"name": "language", "type": "string"},
    {"name": "chunk_index", "type": "pint"},
    {"name": "start_time", "type": "pfloat"},
    {"name": "end_time", "type": "pfloat"},
    {"name": "content", "type": "text_general"},
]


class SolrError(Exception):
    """Raised when Solr is unreachable or rejects a request."""


async def ensure_schema() -> list[str]:
    """Create the fields that do not exist yet. Safe to run many times.

    Returns the names of the fields that were added.
    """
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{settings.solr_url}/schema/fields")
            response.raise_for_status()
            existing = {field["name"] for field in response.json()["fields"]}


            missing = [
                {**field, "indexed": True, "stored": True}
                for field in FIELDS
                if field["name"] not in existing
            ]
            if not missing:
                return []

            response = await client.post(
                f"{settings.solr_url}/schema",
                json={"add-field": missing},
            )
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise SolrError("Solr is unreachable or rejected the request") from exc

    return [field["name"] for field in missing]


async def _post_update(payload, commit: bool) -> None:
    """Send an update request (add / delete / commit) to Solr."""
    params = {"commit": "true"} if commit else {}
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{settings.solr_url}/update", params=params, json=payload
            )
    except httpx.HTTPError as exc:
        raise SolrError("Solr is unreachable") from exc

    if response.status_code != 200:
        raise SolrError(f"Solr returned {response.status_code}: {response.text[:300]}")



async def add_documents(docs: list[dict], commit: bool = False) -> None:
    if docs:
        await _post_update(docs, commit)


async def delete_by_doc_id(doc_id: str, commit: bool = False) -> None:
    await _post_update({"delete": {"query": f'doc_id:"{doc_id}"'}}, commit)


async def commit_changes() -> None:
    await _post_update({"commit": {}}, commit=False)