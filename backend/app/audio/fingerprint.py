import hashlib
from pathlib import Path


def calculate_sha256(file_path: str | Path) -> str:
    """Calculate the SHA-256 fingerprint of a file."""
    digest = hashlib.sha256()

    with open(file_path, "rb") as audio_file:
        for chunk in iter(lambda: audio_file.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()
