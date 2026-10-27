
from pathlib import Path
import time

import whisper

from app.audio.loader import validate_audio_file

_model = None


def get_model():
    """Load the Whisper base model once per Python process."""
    global _model

    if _model is None:
        print("[Whisper] Loading base model...", flush=True)
        _model = whisper.load_model("base")
        print("[Whisper] Model loaded.", flush=True)

    return _model


def transcribe_audio(file_path: str | Path) -> dict:
    """Transcribe audio and return text, language and segments."""
    path = validate_audio_file(file_path)

    print(f"[Whisper] Starting: {path.name}", flush=True)
    start_time = time.time()

    result = get_model().transcribe(
        str(path),
        fp16=False,
        verbose=False,
    )

    print(
        f"[Whisper] Finished in {time.time() - start_time:.1f}s",
        flush=True,
    )

    segments = [
        {
            "text": segment["text"].strip(),
            "start": float(segment["start"]),
            "end": float(segment["end"]),
        }
        for segment in result.get("segments", [])
    ]

    return {
        "source_path": str(path),
        "type": "audio",
        "text": result.get("text", "").strip(),
        "language": result.get("language"),
        "segments": segments,
        "status": "extrait",
    }
