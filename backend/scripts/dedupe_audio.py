import argparse
import asyncio
from collections import defaultdict

from app.database import client, database
from app.indexation.solr_service import commit_changes, delete_by_doc_id


async def main(apply: bool) -> None:
    docs = database["documents"]
    groups = defaultdict(list)
    async for doc in docs.find({"type": "audio"}, {"source_path": 1, "hash": 1, "created_at": 1}):
        groups[doc["hash"]["file"]].append(doc)

    extra = []
    for items in groups.values():
        items.sort(key=lambda doc: doc["created_at"])
        extra.extend(items[1:])  # keep the oldest copy

    for doc in extra:
        print("extra copy:", doc["source_path"], doc["_id"])
    if not extra:
        print("No duplicates.")
    elif not apply:
        print("Dry run. Add --apply to delete.")
    else:
        for doc in extra:
            await delete_by_doc_id(str(doc["_id"]))
        await commit_changes()
        result = await docs.delete_many({"_id": {"$in": [doc["_id"] for doc in extra]}})
        print("deleted from Solr and MongoDB:", result.deleted_count)



if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    async def run():
        try:
            await main(args.apply)
        finally:
            await client.close()

    asyncio.run(run())