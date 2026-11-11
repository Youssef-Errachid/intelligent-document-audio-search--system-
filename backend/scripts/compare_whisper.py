import argparse
import re
import subprocess
import tempfile
import time
from pathlib import Path

from faster_whisper import WhisperModel

ARABIC_MARKS = re.compile(r"[\u064B-\u0652\u0670\u0640]")


def cut_clip(source: Path, start: float, duration: float, target: Path) -> None:
    """Cut a mono 16 kHz clip with ffmpeg (the format used by the pipeline)."""
    subprocess.run(
        [
            "ffmpeg", "-v", "error", "-y",
            "-ss", str(start), "-t", str(duration),
            "-i", str(source), "-vn", "-ac", "1", "-ar", "16000", str(target),
        ],
        check=True,
    )


def normalize(text: str) -> list[str]:
    """Words of a text without punctuation, diacritics and alef/ya variants."""
    text = ARABIC_MARKS.sub("", text.lower())
    text = re.sub("[أإآ]", "ا", text).replace("ى", "ي")
    text = re.sub(r"[^\w\s]", " ", text)
    return text.split()



def wer(reference: list[str], hypothesis: list[str]) -> float:
    """Word error rate: (substitutions + deletions + insertions) / reference words."""
    previous = list(range(len(hypothesis) + 1))
    for i, ref_word in enumerate(reference, start=1):
        current = [i]
        for j, hyp_word in enumerate(hypothesis, start=1):
            cost = 0 if ref_word == hyp_word else 1
            current.append(min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost))
        previous = current
    return previous[-1] / len(reference)


def transcribe(model_path: str, clip: Path) -> dict:
    """Transcribe with the same settings as app/extraction/audio/transcriber.py."""
    started = time.time()
    model = WhisperModel(
        model_path,
        device="cpu",
        compute_type="int8",
        cpu_threads=4,
        local_files_only=True,
    )
    load_seconds = time.time() - started

    started = time.time()
    segments, info = model.transcribe(str(clip), beam_size=1, vad_filter=False)
    text = " ".join(segment.text.strip() for segment in segments)
    seconds = time.time() - started

    return {

        "model": model_path,
        "text": text,
        "language": f"{info.language} ({info.language_probability:.2f})",
        "audio_seconds": info.duration,
        "load_seconds": load_seconds,
        "seconds": seconds,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("audio", type=Path)
    parser.add_argument("--start", type=float, default=0)
    parser.add_argument("--duration", type=float, default=30)
    parser.add_argument("--models", nargs="+", default=["models/whisper-base", "models/whisper-small"])
    parser.add_argument("--reference", type=Path, help="text file with what is really said")
    args = parser.parse_args()

    reference = normalize(args.reference.read_text(encoding="utf-8")) if args.reference else None
    if reference is not None and not reference:
        raise SystemExit("The reference file is empty.")

    with tempfile.TemporaryDirectory() as folder:
        clip = Path(folder) / "clip.wav"
        cut_clip(args.audio, args.start, args.duration, clip)

        for model_path in args.models:
            result = transcribe(model_path, clip)
            speed = result["seconds"] / result["audio_seconds"]

            print(f"\n=== {result['model']}")
            print(f"language: {result['language']}")

            print(f"load: {result['load_seconds']:.1f}s | transcribe: {result['seconds']:.1f}s "
                  f"for {result['audio_seconds']:.0f}s of audio ({speed:.2f}x real time)")
            if reference is not None:
                score = wer(reference, normalize(result["text"]))
                print(f"WER: {score:.1%} ({len(reference)} reference words)")
            print(result["text"])


if __name__ == "__main__":
    main()