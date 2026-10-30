from functools import lru_cache
from faster_whisper import WhisperModel

from app.config import settings


@lru_cache(maxsize=1)
def get_model():
    return WhisperModel(
        settings.whisper_model_path,
        device="cpu",
        compute_type="int8",
        cpu_threads=4,
        local_files_only=True,
    )


def transcribe_audio(audio_path, vad: bool = False):
    model = get_model()

    segments, info = model.transcribe(
        str(audio_path),
        beam_size=1,
        vad_filter=vad,
    )

    transcript_segments = []
    text_parts = []

    for segment in segments:
        segment_text = segment.text.strip()

        if segment_text:
            text_parts.append(segment_text)
            transcript_segments.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment_text,
            })

    text = " ".join(text_parts).strip()

    if not text:
        raise ValueError("No speech detected in the audio file.")

    return {
        "text": text,
        "language": info.language,
        "segments": transcript_segments,
    }