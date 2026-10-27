from pathlib import Path

import whisper

from app.audio.loader import validate_audio_file

_model = None


def get_model():
    """Load the Whisper base model once per Python process."""
    global _model

    if _model is None:
        _model = whisper.load_model("small")

    return _model


def transcribe_audio(file_path: str | Path) -> dict:
    """Transcribe an audio file and return text, language and segments."""
    path = validate_audio_file(file_path)

    result = get_model().transcribe(
        str(path),
        fp16=False,
        verbose=False,
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
