import asyncio
import sys

from app.extraction.documents.tika_service import _join_text, extract_text


async def main():
    for path in sys.argv[1:]:
        with open(path, "rb") as f:
            text = (await extract_text(f.read()))["text"]
        print(path.rsplit("/", 1)[-1])
        print("  chars:", len(text))
        print("  has CHAINE:", "CHAINE" in text, "| has image1:", "image1" in text)
        print("  last 80:", repr(text[-80:]))

    # Safety net: a scanned document has almost no main text, so the text
    # of the embedded images must be kept.
    scanned = [
        {"Content-Type": "application/pdf", "tk:content": ""},
        {"Content-Type": "image/png", "tk:content": "texte du scan"},
    ]
    print("\nscanned fallback:", repr(_join_text(scanned)))

    # A sentence that mentions an image name must not be touched.
    keep = [{"Content-Type": "text/plain", "tk:content": "Voir image1.png dans le dossier. " * 5}]
    print("mention kept:", "image1.png" in _join_text(keep))


asyncio.run(main())