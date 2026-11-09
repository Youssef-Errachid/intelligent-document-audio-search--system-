import re

import httpx

from app.config import settings

MIN_MAIN_TEXT_CHARS = 100

RESOURCE_NAME_LINE = re.compile(
    r"^[ \t]*image\d+\.(?:png|jpe?g|gif|bmp|tiff?|emf|wmf)[ \t]*$",
    re.IGNORECASE | re.MULTILINE,
)


class TikaError(Exception):
    """Raised when Tika is unreachable or cannot parse the file."""


def _content_type(item: dict) -> str:
    value = item.get("Content-Type", "application/octet-stream")
    if isinstance(value, list):
        value = value[0]
    return value.split(";")[0].strip()


def _join_text(items: list[dict]) -> str:
    """Join the text of the main document and of its embedded resources.


    Embedded images (logos, banners) only add OCR noise when the document
    already has real text, so we skip them in that case. The names of the
    embedded images that Tika appends to the text are removed too.
    """
    main_text = items[0].get("tk:content", "").strip()
    keep_images = len(main_text) < MIN_MAIN_TEXT_CHARS

    parts = [main_text]
    for item in items[1:]:
        if not keep_images and _content_type(item).startswith("image/"):
            continue
        parts.append(item.get("tk:content", "").strip())

    text = "\n\n".join(part for part in parts if part)
    return RESOURCE_NAME_LINE.sub("", text).strip()


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

    text = _join_text(items)
    mime_type = _content_type(main)

    metadata = {
        "pages": main.get("xmpTPg:NPages"),
        "ocr_pages": main.get("pdf:ocr-page-count"),
    }
    metadata = {key: value for key, value in metadata.items() if value is not None}

    return {"text": text, "mime_type": mime_type, "metadata": metadata}