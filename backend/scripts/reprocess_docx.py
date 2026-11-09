import argparse
import asyncio
from pathlib import Path

from app.database import client, database
from app.extraction.documents.tika_service import TikaError, extract_text
from app.extraction.hash_service import sha256_bytes, sha256_text
from app.indexation.indexer import index_document


def index_files_by_hash(root: Path) -> dict[str, Path]:
    """Map the SHA-256 of every .docx file under root to its path."""
    return {sha256_bytes(path.read_bytes()): path for path in root.rglob("*.docx")}


async def main(root: Path, apply: bool) -> None:
    files = index_files_by_hash(root)
    print(f"{len(files)} distinct .docx files found under {root}\n")

    collection = database["documents"]
    counts = {"updated": 0, "unchanged": 0, "skipped": 0}

    async for doc in collection.find({"type": "docx"}):
        name = doc["source_path"]
        path = files.get(doc.get("hash", {}).get("file"))

        if path is None:
            print(f"SKIP    no file with this hash on disk     {name}")
            counts["skipped"] += 1
            continue

        try:

            extracted = await extract_text(path.read_bytes())
        except TikaError as exc:
            print(f"SKIP    Tika failed ({exc})     {name}")
            counts["skipped"] += 1
            continue

        new_text = extracted["text"]
        if not new_text:
            print(f"SKIP    new text is empty, keeping the old one     {name}")
            counts["skipped"] += 1
            continue

        if new_text == doc.get("text"):
            counts["unchanged"] += 1
            continue

        label = "UPDATE" if apply else "WOULD UPDATE"
        print(f"{label:<12}{len(doc.get('text', '')):>7} -> {len(new_text):<7} {name}")
        counts["updated"] += 1

        if apply:
            await collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"text": new_text, "hash.text": sha256_text(new_text)}},
            )
            await index_document(await collection.find_one({"_id": doc["_id"]}))

    print(f"\n{counts}")
    if not apply:
        print("Dry run: nothing was written. Add --apply to write.")



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path, help="folder that contains the original files")
    parser.add_argument("--apply", action="store_true", help="write the changes")
    args = parser.parse_args()

    async def run():
        try:
            await main(args.root, args.apply)
        finally:
            await client.close()

    asyncio.run(run())