import httpx
pp/routers/documents.py

pp/routers/documents.py
from app.config import settings
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
class TikaError(Exception):
pp/routers/documents.py
    """Raised when Tika is unreachable or cannot parse the file."""
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
async def extract_text(content: bytes) -> dict:
pp/routers/documents.py
    """Send raw file bytes to Tika and return text, mime type and metadata."""
pp/routers/documents.py
    try:
pp/routers/documents.py
        async with httpx.AsyncClient(timeout=120) as client:
pp/routers/documents.py
            response = await client.put(
pp/routers/documents.py
                f"{settings.tika_url}/rmeta/text",
pp/routers/documents.py
                content=content,
pp/routers/documents.py
                headers={"Accept": "application/json"},
pp/routers/documents.py
            )
pp/routers/documents.py
    except httpx.HTTPError as exc:
pp/routers/documents.py
        raise TikaError("Tika server is unreachable") from exc
pp/routers/documents.py

pp/routers/documents.py
    if response.status_code != 200:
pp/routers/documents.py
        raise TikaError(f"Tika returned status {response.status_code}")
pp/routers/documents.py

pp/routers/documents.py
    items = response.json()
pp/routers/documents.py
    main = items[0]
pp/routers/documents.py

pp/routers/documents.py
    text = "\n\n".join(item.get("tk:content", "") for item in items).strip()
pp/routers/documents.py

pp/routers/documents.py
    content_type = main.get("Content-Type", "application/octet-stream")
pp/routers/documents.py
    if isinstance(content_type, list):
pp/routers/documents.py
        content_type = content_type[0]
pp/routers/documents.py
    mime_type = content_type.split(";")[0].strip()
pp/routers/documents.py

pp/routers/documents.py
    metadata = {
pp/routers/documents.py
        "pages": main.get("xmpTPg:NPages"),
pp/routers/documents.py
        "ocr_pages": main.get("pdf:ocr-page-count"),
pp/routers/documents.py
    }
pp/routers/documents.py
    metadata = {key: value for key, value in metadata.items() if value is not None}
pp/routers/documents.py

pp/routers/documents.py
    return {"text": text, "mime_type": mime_type, "metadata": metadata}
pp/routers/documents.py
