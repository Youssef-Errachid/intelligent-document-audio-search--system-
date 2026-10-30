import logging
pp/routers/documents.py
import os
pp/routers/documents.py
import tempfile
pp/routers/documents.py
from datetime import datetime, timezone
pp/routers/documents.py
from pathlib import Path
pp/routers/documents.py

pp/routers/documents.py
from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile
pp/routers/documents.py
from starlette.concurrency import run_in_threadpool
pp/routers/documents.py

pp/routers/documents.py
from app.audio.fingerprint import AudioDecodeError, calculate_decoded_audio_hash
pp/routers/documents.py
from app.audio.transcriber import transcribe_audio
pp/routers/documents.py
from app.database import database
pp/routers/documents.py
from app.schemas import UploadResponse
pp/routers/documents.py
from app.services.hash_service import sha256_bytes, sha256_text
pp/routers/documents.py

pp/routers/documents.py
logger = logging.getLogger(__name__)
pp/routers/documents.py
router = APIRouter(prefix="/audio", tags=["audio"])
pp/routers/documents.py

pp/routers/documents.py
ALLOWED_EXTENSIONS = {
pp/routers/documents.py
    ".wav", ".mp3", ".m4a", ".flac", ".ogg", ".aac", ".wma",
pp/routers/documents.py
    ".mp4", ".mpeg", ".mpga", ".opus", ".webm",
pp/routers/documents.py
}
pp/routers/documents.py
MAX_FILE_SIZE = 50 * 1024 * 1024
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
def duplicate_response(doc: dict) -> UploadResponse:
pp/routers/documents.py
    return UploadResponse(
pp/routers/documents.py
        id=str(doc["_id"]),
pp/routers/documents.py
        source_path=doc["source_path"],
pp/routers/documents.py
        type="audio",
pp/routers/documents.py
        status=doc.get("status", "extrait"),
pp/routers/documents.py
        duplicate=True,
pp/routers/documents.py
        characters=len(doc.get("text", "")),
pp/routers/documents.py
    )
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
@router.post("/upload", response_model=UploadResponse, status_code=201)
pp/routers/documents.py
async def upload_audio(
pp/routers/documents.py
    response: Response,
pp/routers/documents.py
    file: UploadFile = File(...),
pp/routers/documents.py
    vad: bool = Form(False),
pp/routers/documents.py
):
pp/routers/documents.py
    filename = Path(file.filename or "").name
pp/routers/documents.py
    extension = Path(filename).suffix.lower()
pp/routers/documents.py

pp/routers/documents.py
    if not filename or extension not in ALLOWED_EXTENSIONS:
pp/routers/documents.py
        raise HTTPException(status_code=415, detail="Unsupported audio format.")
pp/routers/documents.py

pp/routers/documents.py
    content = await file.read(MAX_FILE_SIZE + 1)
pp/routers/documents.py
    await file.close()
pp/routers/documents.py

pp/routers/documents.py
    if not content:
pp/routers/documents.py
        raise HTTPException(status_code=400, detail="The audio file is empty.")
pp/routers/documents.py

pp/routers/documents.py
    if len(content) > MAX_FILE_SIZE:
pp/routers/documents.py
        raise HTTPException(status_code=413, detail="Maximum file size is 50 MB.")
pp/routers/documents.py

pp/routers/documents.py
    collection = database["documents"]
pp/routers/documents.py

pp/routers/documents.py
    file_hash = sha256_bytes(content)
pp/routers/documents.py
    existing = await collection.find_one({"type": "audio", "hash.file": file_hash})
pp/routers/documents.py
    if existing:
pp/routers/documents.py
        response.status_code = 200
pp/routers/documents.py
        return duplicate_response(existing)
pp/routers/documents.py

pp/routers/documents.py
    temp_path = None
pp/routers/documents.py
    try:
pp/routers/documents.py
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temp_file:
pp/routers/documents.py
            temp_file.write(content)
pp/routers/documents.py
            temp_path = temp_file.name
pp/routers/documents.py

pp/routers/documents.py
        try:
pp/routers/documents.py
            audio_hash = await run_in_threadpool(calculate_decoded_audio_hash, temp_path)
pp/routers/documents.py
        except AudioDecodeError as exc:
pp/routers/documents.py
            logger.exception("Audio decoding failed: %s", exc)
pp/routers/documents.py
            raise HTTPException(
pp/routers/documents.py
                status_code=422, detail="The audio file could not be decoded."
pp/routers/documents.py
            ) from exc
pp/routers/documents.py

pp/routers/documents.py
        existing = await collection.find_one({"type": "audio", "hash.audio": audio_hash})
pp/routers/documents.py
        if existing:
pp/routers/documents.py
            response.status_code = 200
pp/routers/documents.py
            return duplicate_response(existing)
pp/routers/documents.py

pp/routers/documents.py
        extracted = await run_in_threadpool(transcribe_audio, temp_path, vad)
pp/routers/documents.py

pp/routers/documents.py
    except HTTPException:
pp/routers/documents.py
        raise
pp/routers/documents.py
    except Exception as exc:
pp/routers/documents.py
        logger.exception("Audio transcription failed: %s", exc)
pp/routers/documents.py
        raise HTTPException(
pp/routers/documents.py
            status_code=422,
pp/routers/documents.py
            detail="Audio transcription failed. Check the backend logs.",
pp/routers/documents.py
        ) from exc
pp/routers/documents.py
    finally:
pp/routers/documents.py
        if temp_path and os.path.exists(temp_path):
pp/routers/documents.py
            os.remove(temp_path)
pp/routers/documents.py

pp/routers/documents.py
    text = extracted["text"]
pp/routers/documents.py

pp/routers/documents.py
    document = {
pp/routers/documents.py
        "source_path": filename,
pp/routers/documents.py
        "type": "audio",
pp/routers/documents.py
        "text": text,
pp/routers/documents.py
        "language": extracted.get("language"),
pp/routers/documents.py
        "segments": extracted.get("segments", []),
pp/routers/documents.py
        "hash": {
pp/routers/documents.py
            "file": file_hash,
pp/routers/documents.py
            "audio": audio_hash,
pp/routers/documents.py
            "text": sha256_text(text),
pp/routers/documents.py
        },
pp/routers/documents.py
        "metadata": {
pp/routers/documents.py
            "size_bytes": len(content),
pp/routers/documents.py
            "mime_type": file.content_type,
pp/routers/documents.py
            "origin": "upload",
pp/routers/documents.py
            "vad": vad,
pp/routers/documents.py
        },
pp/routers/documents.py
        "status": "extrait",
pp/routers/documents.py
        "created_at": datetime.now(timezone.utc),
pp/routers/documents.py
    }
pp/routers/documents.py

pp/routers/documents.py
    result = await collection.insert_one(document)
pp/routers/documents.py

pp/routers/documents.py
    return UploadResponse(
pp/routers/documents.py
        id=str(result.inserted_id),
pp/routers/documents.py
        source_path=filename,
pp/routers/documents.py
        type="audio",
pp/routers/documents.py
        status="extrait",
pp/routers/documents.py
        duplicate=False,
pp/routers/documents.py
        characters=len(text),
pp/routers/documents.py
    )
pp/routers/documents.py
