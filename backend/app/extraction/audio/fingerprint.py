import hashlib
pp/routers/documents.py
import subprocess
pp/routers/documents.py
from pathlib import Path
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
class AudioDecodeError(Exception):
pp/routers/documents.py
    """Raised when ffmpeg is missing or cannot decode the audio file."""
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
def calculate_decoded_audio_hash(file_path: str | Path) -> str:
pp/routers/documents.py
    """Decode audio to raw PCM (16 kHz, mono, 16-bit) and return its SHA-256.
pp/routers/documents.py

pp/routers/documents.py
    The same recording stored in two lossless formats gives the same hash,
pp/routers/documents.py
    because we hash the decoded samples and not the container bytes.
pp/routers/documents.py
    """
pp/routers/documents.py
    command = [
pp/routers/documents.py
        "ffmpeg",
pp/routers/documents.py
        "-v", "error",
pp/routers/documents.py
        "-nostdin",
pp/routers/documents.py
        "-i", str(file_path),
pp/routers/documents.py
        "-vn",
pp/routers/documents.py
        "-ac", "1",
pp/routers/documents.py
        "-ar", "16000",
pp/routers/documents.py
        "-f", "s16le",
pp/routers/documents.py
        "-",
pp/routers/documents.py
    ]
pp/routers/documents.py

pp/routers/documents.py
    try:
pp/routers/documents.py
        process = subprocess.Popen(
pp/routers/documents.py
            command, stdout=subprocess.PIPE, stderr=subprocess.PIPE
pp/routers/documents.py
        )
pp/routers/documents.py
    except FileNotFoundError as exc:
pp/routers/documents.py
        raise AudioDecodeError("ffmpeg is not installed.") from exc
pp/routers/documents.py

pp/routers/documents.py
    digest = hashlib.sha256()
pp/routers/documents.py
    total_bytes = 0
pp/routers/documents.py

pp/routers/documents.py
    while chunk := process.stdout.read(1024 * 1024):
pp/routers/documents.py
        digest.update(chunk)
pp/routers/documents.py
        total_bytes += len(chunk)
pp/routers/documents.py

pp/routers/documents.py
    error_output = process.stderr.read().decode(errors="ignore").strip()
pp/routers/documents.py
    process.wait()
pp/routers/documents.py

pp/routers/documents.py
    if process.returncode != 0 or total_bytes == 0:
pp/routers/documents.py
        raise AudioDecodeError(f"ffmpeg could not decode the audio. {error_output}")
pp/routers/documents.py

pp/routers/documents.py
    return digest.hexdigest()
pp/routers/documents.py
