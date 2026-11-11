import asyncio
import hashlib
import mimetypes
from datetime import datetime, timezone
from pathlib import Path

from app.database import database
from app.extraction.audio.fingerprint import calculate_decoded_audio_hash
from app.extraction.audio.loader import validate_audio_file
from app.extraction.audio.transcriber import transcribe_audio
from app.extraction.hash_service import sha256_text
from app.indexation.indexer import try_index_document


def sha256_file(path: Path) -> str:
    """SHA-256 of a file, read in chunks so big files do not fill the memory."""
    digest = hashlib.sha256()
    with path.open("rb") as file:
        while chunk := file.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


async def ingest_audio_file(path: Path, vad: bool = False) -> tuple[str, int]:
    """Transcribe, store and index one audio file from the disk.

    Returns (outcome, characters). The outcome is "duplicate" when the file
    (or the same decoded audio) is already stored, otherwise the document
    status: "indexe", or "extrait" when the indexing step failed.
    """
    path = validate_audio_file(path)
    collection = database["documents"]


    # blocking work goes to a thread so the event loop stays free
    file_hash = await asyncio.to_thread(sha256_file, path)
    if await collection.find_one({"type": "audio", "hash.file": file_hash}):
        return "duplicate", 0

    audio_hash = await asyncio.to_thread(calculate_decoded_audio_hash, path)
    if await collection.find_one({"type": "audio", "hash.audio": audio_hash}):
        return "duplicate", 0

    extracted = await asyncio.to_thread(transcribe_audio, path, vad)
    text = extracted["text"]

    document = {
        "source_path": path.name,
        "type": "audio",
        "text": text,
        "language": extracted.get("language"),
        "segments": extracted.get("segments", []),
        "hash": {
            "file": file_hash,
            "audio": audio_hash,
            "text": sha256_text(text),
        },
        "metadata": {
            "size_bytes": path.stat().st_size,
            "mime_type": mimetypes.guess_type(path.name)[0],
            "origin": "batch",
            "vad": vad,
        },
        "status": "extrait",
        "created_at": datetime.now(timezone.utc),

    }

    await collection.insert_one(document)  # adds "_id" to the dict
    status = await try_index_document(document)
    return status, len(text)