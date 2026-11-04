import httpx

from app.config import settings

FIELD_TYPES = [
    {
        "name": "text_folded",
        "class": "solr.TextField",
        "positionIncrementGap": "100",
        "analyzer": {
            "tokenizer": {"class": "solr.StandardTokenizerFactory"},
            "filters": [
                {"class": "solr.ElisionFilterFactory", "ignoreCase": "true"},
                {"class": "solr.LowerCaseFilterFactory"},
                {"class": "solr.ASCIIFoldingFilterFactory", "preserveOriginal": "false"},
            ],
        },
    },
]

FIELDS = [
    {"name": "doc_id", "type": "string"},
    {"name": "source_path", "type": "string"},
    {"name": "doc_type", "type": "string"},
    {"name": "language", "type": "string"},
    {"name": "chunk_index", "type": "pint"},
    {"name": "start_time", "type": "pfloat"},
    {"name": "end_time", "type": "pfloat"},
    {"name": "content", "type": "text_folded"},
]


class SolrError(Exception):
    """Raised when Solr is unreachable or rejects a request."""


async def ensure_schema() -> dict:
    """Create missing field types and fields. Safe to run many times.

    Returns {"added": [...], "mismatched": [...]}.
    A mismatched field already exists with another type: Solr cannot change it
    safely, so the core must be rebuilt and the documents indexed again.
    """
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{settings.solr_url}/schema/fieldtypes")
            response.raise_for_status()
            existing_types = {item["name"] for item in response.json()["fieldTypes"]}

            missing_types = [t for t in FIELD_TYPES if t["name"] not in existing_types]
            if missing_types:
                response = await client.post(
                    f"{settings.solr_url}/schema",
                    json={"add-field-type": missing_types},
                )
                response.raise_for_status()

            response = await client.get(f"{settings.solr_url}/schema/fields")
            response.raise_for_status()
            existing = {item["name"]: item for item in response.json()["fields"]}

            missing = [
                {**field, "indexed": True, "stored": True, "multiValued": False}
                for field in FIELDS
                if field["name"] not in existing
            ]
            mismatched = [
                field["name"]
                for field in FIELDS
                if field["name"] in existing
                and existing[field["name"]]["type"] != field["type"]
            ]

            if missing:
                response = await client.post(
                    f"{settings.solr_url}/schema",
                    json={"add-field": missing},
                )
                response.raise_for_status()
    except httpx.HTTPError as exc:
        raise SolrError("Solr is unreachable or rejected the request") from exc

    added = [t["name"] for t in missing_types] + [f["name"] for f in missing]
    return {"added": added, "mismatched": mismatched}


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


async def delete_all(commit: bool = False) -> None:
    await _post_update({"delete": {"query": "*:*"}}, commit)


async def commit_changes() -> None:
    await _post_update({"commit": {}}, commit=False)


async def search_chunks(query: str, limit: int = 10) -> list[dict]:
    """BM25 search on chunk content, keeping only the best chunk of each document."""
    params = {
        "q": query,
        "defType": "edismax",
        "qf": "content",
        "fq": "{!collapse field=doc_id}",
        "fl": "doc_id,source_path,doc_type,chunk_index,start_time,end_time,content,score",
        "rows": limit,
    }
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(f"{settings.solr_url}/select", params=params)
    except httpx.HTTPError as exc:
        raise SolrError("Solr is unreachable") from exc

    if response.status_code != 200:
        raise SolrError(f"Solr returned {response.status_code}: {response.text[:300]}")

    return response.json()["response"]["docs"]