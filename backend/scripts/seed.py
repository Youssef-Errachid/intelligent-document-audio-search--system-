import asyncio
import hashlib

from app.database import client, database


def sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


SAMPLES = [
    {
        "source_path": "sample/rapport_climat.pdf",
        "type": "pdf",
        "text": "Le changement du climat menace les récoltes et augmente la fréquence des sécheresses dans la région.",
        "language": "fr",
        "metadata": {"pages": 12, "origin": "seed"},
        "segments": [],
        "status": "extrait",
    },
    {
        "source_path": "sample/note_budget.docx",
        "type": "docx",
        "text": "Le budget annuel du service informatique a été approuvé et sera réparti entre trois projets.",
        "language": "fr",
        "metadata": {"author": "demo", "origin": "seed"},
        "segments": [],
        "status": "extrait",
    },
    {
        "source_path": "sample/interview_radio.wav",
        "type": "audio",
        "text": "Le réchauffement de la planète s'accélère. Les scientifiques demandent des mesures urgentes.",
        "language": "fr",
        "metadata": {"duration_s": 14.0, "origin": "seed"},
        "segments": [
            {"text": "Le réchauffement de la planète s'accélère.", "start": 0.0, "end": 5.5},
            {"text": "Les scientifiques demandent des mesures urgentes.", "start": 5.5, "end": 14.0},
        ],
        "status": "extrait",
    },
]


async def main():
    collection = database["documents"]

    for sample in SAMPLES:
        sample["hash"] = {
            "file": sha256("sample:" + sample["source_path"]),  # fake file hash
            "text": sha256(sample["text"]),
        }
        await collection.update_one(
            {"hash.file": sample["hash"]["file"]},
            {"$set": sample},
            upsert=True,
        )

    total = await collection.count_documents({})
    print(f"Seed done. documents in collection: {total}")
    await client.close()


if __name__ == "__main__":
    asyncio.run(main())