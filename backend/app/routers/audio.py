import logging
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Response, UploadFile
from starlette.concurrency import run_in_threadpool

from app.audio.fingerprint import AudioDecodeError, calculate_decoded_audio_hash
from app.audio.transcriber import transcribe_audio
from app.database import database
from app.schemas import UploadResponse
from app.services.hash_service import sha256_bytes, sha256_text

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/audio", tags=["audio"])

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".aac", ".wma"}
MAX_FILE_SIZE = 50 * 1024 * 1024


def duplicate_response(doc: dict) -> UploadResponse:
    return UploadResponse(
        id=str(doc["_id"]),
        source_path=doc["source_path"],
        type="audio",
        status=doc.get("status", "extrait"),
        duplicate=True,
        characters=len(doc.get("text", "")),
    )


@router.post("/upload", response_model=UploadResponse, status_code=201)
async def upload_audio(response: Response, file: UploadFile = File(...)):
    filename = Path(file.filename or "").name
    extension = Path(filename).suffix.lower()

    if not filename or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Unsupported audio format.")

    content = await file.read(MAX_FILE_SIZE + 1)
    await file.close()

    if not content:
        raise HTTPException(status_code=400, detail="The audio file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Maximum file size is 50 MB.")

    collection = database["documents"]

    file_hash = sha256_bytes(content)
    existing = await collection.find_one({"type": "audio", "hash.file": file_hash})
    if existing:
        response.status_code = 200
        return duplicate_response(existing)

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        try:
            audio_hash = await run_in_threadpool(calculate_decoded_audio_hash, temp_path)
        except AudioDecodeError as exc:
            logger.exception("Audio decoding failed: %s", exc)
            raise HTTPException(
                status_code=422, detail="The audio file could not be decoded."
            ) from exc

        existing = await collection.find_one({"type": "audio", "hash.audio": audio_hash})
        if existing:
            response.status_code = 200
            return duplicate_response(existing)

        extracted = await run_in_threadpool(transcribe_audio, temp_path)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Audio transcription failed: %s", exc)
        raise HTTPException(
            status_code=422,
            detail="Audio transcription failed. Check the backend logs.",
        ) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

    text = extracted["text"]

    document = {
        "source_path": filename,
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
            "size_bytes": len(content),
            "mime_type": file.content_type,
            "origin": "upload",
        },
        "status": "extrait",
        "created_at": datetime.now(timezone.utc),
    }

    result = await collection.insert_one(document)

    return UploadResponse(
        id=str(result.inserted_id),
        source_path=filename,
        type="audio",
        status="extrait",
        duplicate=False,
        characters=len(text),
    )