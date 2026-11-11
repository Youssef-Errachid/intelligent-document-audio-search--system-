import argparse
import asyncio
import time
from collections import Counter
from pathlib import Path

from app.database import client
from app.extraction.audio.loader import SUPPORTED_EXTENSIONS
from app.extraction.audio.pipeline import ingest_audio_file


async def main(folder: Path, limit: int | None, vad: bool) -> None:
    # smallest files first: quick feedback, and a problem shows up early
    files = sorted(
        (p for p in folder.rglob("*") if p.suffix.lower() in SUPPORTED_EXTENSIONS),
        key=lambda p: p.stat().st_size,
    )
    if limit:
        files = files[:limit]
    print(f"{len(files)} audio files to process (vad={vad})\n")

    counts = Counter()
    started = time.time()

    for number, path in enumerate(files, start=1):
        file_started = time.time()
        detail = ""
        try:
            outcome, characters = await ingest_audio_file(path, vad)
            if characters:
                detail = f"{characters} characters"
        except Exception as exc:  # one bad file must not stop the batch

            outcome = "failed"
            detail = f"{type(exc).__name__}: {exc}"[:150]

        counts[outcome] += 1
        seconds = time.time() - file_started
        print(f"[{number}/{len(files)}] {outcome:<9} {seconds:6.0f}s  {path.name}  {detail}")

    print(f"\n{dict(counts)} in {(time.time() - started) / 60:.1f} minutes")
    if counts["extrait"]:
        print("Some documents are stored but not indexed: run scripts.index_all.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("--limit", type=int, help="only the N smallest files")
    parser.add_argument("--vad", action="store_true", help="skip silence (see the upload page)")
    args = parser.parse_args()

    async def run():
        try:
            await main(args.folder, args.limit, args.vad)
        finally:
            await client.close()

    asyncio.run(run())