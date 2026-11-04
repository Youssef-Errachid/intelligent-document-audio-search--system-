import asyncio

from app.indexation.solr_service import ensure_schema


async def main():
    result = await ensure_schema()

    if result["added"]:
        print("Added:", ", ".join(result["added"]))

    if result["mismatched"]:
        print("WARNING: these fields exist with another type:", ", ".join(result["mismatched"]))
        print("Rebuild the core: docker compose down -v && docker compose up -d,")
        print("then run this script again and scripts.index_all.")

    if not result["added"] and not result["mismatched"]:
        print("Schema already up to date.")


if __name__ == "__main__":
    asyncio.run(main())