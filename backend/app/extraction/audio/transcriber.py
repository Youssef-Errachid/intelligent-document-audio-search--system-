from functools import lru_cache
pp/routers/documents.py
from faster_whisper import WhisperModel
pp/routers/documents.py

pp/routers/documents.py
from app.config import settings
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
@lru_cache(maxsize=1)
pp/routers/documents.py
def get_model():
pp/routers/documents.py
    return WhisperModel(
pp/routers/documents.py
        settings.whisper_model_path,
pp/routers/documents.py
        device="cpu",
pp/routers/documents.py
        compute_type="int8",
pp/routers/documents.py
        cpu_threads=4,
pp/routers/documents.py
        local_files_only=True,
pp/routers/documents.py
    )
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
def transcribe_audio(audio_path, vad: bool = False):
pp/routers/documents.py
    model = get_model()
pp/routers/documents.py

pp/routers/documents.py
    segments, info = model.transcribe(
pp/routers/documents.py
        str(audio_path),
pp/routers/documents.py
        beam_size=1,
pp/routers/documents.py
        vad_filter=vad,
pp/routers/documents.py
    )
pp/routers/documents.py

pp/routers/documents.py
    transcript_segments = []
pp/routers/documents.py
    text_parts = []
pp/routers/documents.py

pp/routers/documents.py
    for segment in segments:
pp/routers/documents.py
        segment_text = segment.text.strip()
pp/routers/documents.py

pp/routers/documents.py
        if segment_text:
pp/routers/documents.py
            text_parts.append(segment_text)
pp/routers/documents.py
            transcript_segments.append({
pp/routers/documents.py
                "start": segment.start,
pp/routers/documents.py
                "end": segment.end,
pp/routers/documents.py
                "text": segment_text,
pp/routers/documents.py
            })
pp/routers/documents.py

pp/routers/documents.py
    text = " ".join(text_parts).strip()
pp/routers/documents.py

pp/routers/documents.py
    if not text:
pp/routers/documents.py
        raise ValueError("No speech detected in the audio file.")
pp/routers/documents.py

pp/routers/documents.py
    return {
pp/routers/documents.py
        "text": text,
pp/routers/documents.py
        "language": info.language,
pp/routers/documents.py
        "segments": transcript_segments,
pp/routers/documents.py
    }
pp/routers/documents.py
