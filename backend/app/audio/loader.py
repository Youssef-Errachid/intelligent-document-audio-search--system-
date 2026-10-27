from pathlib import Path

SUPPORTED_EXTENSIONS = {
    ".wav", ".mp3", ".m4a", ".flac", ".ogg", ".aac", ".wma"
}


def validate_audio_file(file_path: str | Path) -> Path:
    """Validate that the audio file exists and uses a supported extension."""
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {path}")

    if not path.is_file():
        raise ValueError(f"Not a file: {path}")

    if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError(f"Unsupported audio format: {path.suffix}")

    if path.stat().st_size == 0:
        raise ValueError("Audio file is empty")

    return path
