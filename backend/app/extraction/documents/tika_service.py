import httpx

from app.config import settings


class TikaError(Exception):
    """Raised when Tika is unreachable or cannot parse the file."""


async def extract_text(content: bytes) -> dict:
    """Send raw file bytes to Tika and return text, mime type and metadata."""
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.put(
                f"{settings.tika_url}/rmeta/text",
                content=content,
                headers={"Accept": "application/json"},
            )
    except httpx.HTTPError as exc:
        raise TikaError("Tika server is unreachable") from exc

    if response.status_code != 200:
        raise TikaError(f"Tika returned status {response.status_code}")

    items = response.json()
    main = items[0]

    text = "\n\n".join(item.get("tk:content", "") for item in items).strip()

    content_type = main.get("Content-Type", "application/octet-stream")
    if isinstance(content_type, list):
        content_type = content_type[0]
    mime_type = content_type.split(";")[0].strip()

    metadata = {
        "pages": main.get("xmpTPg:NPages"),
        "ocr_pages": main.get("pdf:ocr-page-count"),
    }
    metadata = {key: value for key, value in metadata.items() if value is not None}

    return {"text": text, "mime_type": mime_type, "metadata": metadata}
