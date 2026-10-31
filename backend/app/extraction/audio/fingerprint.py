import hashlib
import subprocess
from pathlib import Path


class AudioDecodeError(Exception):
    """Raised when ffmpeg is missing or cannot decode the audio file."""


def calculate_decoded_audio_hash(file_path: str | Path) -> str:
    """Decode audio to raw PCM (16 kHz, mono, 16-bit) and return its SHA-256.

    The same recording stored in two lossless formats gives the same hash,
    because we hash the decoded samples and not the container bytes.
    """
    command = [
        "ffmpeg",
        "-v", "error",
        "-nostdin",
        "-i", str(file_path),
        "-vn",
        "-ac", "1",
        "-ar", "16000",
        "-f", "s16le",
        "-",
    ]

    try:
        process = subprocess.Popen(
            command, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
    except FileNotFoundError as exc:
        raise AudioDecodeError("ffmpeg is not installed.") from exc

    digest = hashlib.sha256()
    total_bytes = 0

    while chunk := process.stdout.read(1024 * 1024):
        digest.update(chunk)
        total_bytes += len(chunk)

    error_output = process.stderr.read().decode(errors="ignore").strip()
    process.wait()

    if process.returncode != 0 or total_bytes == 0:
        raise AudioDecodeError(f"ffmpeg could not decode the audio. {error_output}")

    return digest.hexdigest()
