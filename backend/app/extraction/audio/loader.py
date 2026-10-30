from pathlib import Path
pp/routers/documents.py

pp/routers/documents.py
SUPPORTED_EXTENSIONS = {
pp/routers/documents.py
    ".wav", ".mp3", ".m4a", ".flac", ".ogg", ".aac", ".wma"
pp/routers/documents.py
}
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
def validate_audio_file(file_path: str | Path) -> Path:
pp/routers/documents.py
    """Validate that the audio file exists and uses a supported extension."""
pp/routers/documents.py
    path = Path(file_path)
pp/routers/documents.py

pp/routers/documents.py
    if not path.exists():
pp/routers/documents.py
        raise FileNotFoundError(f"Audio file not found: {path}")
pp/routers/documents.py

pp/routers/documents.py
    if not path.is_file():
pp/routers/documents.py
        raise ValueError(f"Not a file: {path}")
pp/routers/documents.py

pp/routers/documents.py
    if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
pp/routers/documents.py
        raise ValueError(f"Unsupported audio format: {path.suffix}")
pp/routers/documents.py

pp/routers/documents.py
    if path.stat().st_size == 0:
pp/routers/documents.py
        raise ValueError("Audio file is empty")
pp/routers/documents.py

pp/routers/documents.py
    return path
pp/routers/documents.py
