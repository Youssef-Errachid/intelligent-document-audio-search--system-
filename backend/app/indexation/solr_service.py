import httpx

from app.config import settings

VECTOR_TYPE = f"knn_vector_{settings.embedding_dimension}"

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
    {
        "name": VECTOR_TYPE,
        "class": "solr.DenseVectorField",
        "vectorDimension": settings.embedding_dimension,
        "similarityFunction": "cosine",
    },
]


FIELD_DEFAULTS = {"indexed": True, "stored": True, "multiValued": False}

FIELDS = [
    {"name": "doc_id", "type": "string"},
    {"name": "source_path", "type": "string"},
    {"name": "doc_type", "type": "string"},
    {"name": "language", "type": "string"},
    {"name": "chunk_index", "type": "pint"},
    {"name": "start_time", "type": "pfloat"},
    {"name": "end_time", "type": "pfloat"},
    {"name": "content", "type": "text_folded"},
    {"name": "vector", "type": VECTOR_TYPE, "stored": False},
]

RESULT_FIELDS = "doc_id,source_path,doc_type,chunk_index,start_time,end_time,content,score"

COLLAPSE_BY_DOCUMENT = "{!collapse field=doc_id}"

KNN_CHUNKS_PER_RESULT = 5


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
                {**FIELD_DEFAULTS, **field}
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


async def _select(params: dict) -> list[dict]:
    """Run a search request and return the matching Solr documents.

    We use POST because a query vector is too long for a URL.
    """
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(f"{settings.solr_url}/select", data=params)
    except httpx.HTTPError as exc:
        raise SolrError("Solr is unreachable") from exc

    if response.status_code != 200:
        raise SolrError(f"Solr returned {response.status_code}: {response.text[:300]}")

    return response.json()["response"]["docs"]



async def search_chunks(query: str, limit: int = 10) -> list[dict]:
    """BM25 search on chunk content, keeping only the best chunk of each document."""
    return await _select({
        "q": query,
        "defType": "edismax",
        "qf": "content",
        "fq": COLLAPSE_BY_DOCUMENT,
        "fl": RESULT_FIELDS,
        "rows": limit,
    })


async def search_vectors(vector: list[float], limit: int = 10) -> list[dict]:
    """Nearest-chunk search on the vector field, best chunk of each document."""
    top_k = limit * KNN_CHUNKS_PER_RESULT
    return await _select({
        "q": "{!knn f=vector topK=" + str(top_k) + "}" + str(vector),
        "fq": COLLAPSE_BY_DOCUMENT,
        "fl": RESULT_FIELDS,
        "rows": limit,
    })
