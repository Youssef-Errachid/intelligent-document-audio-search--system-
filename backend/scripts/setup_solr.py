import asyncio

from app.indexation.solr_service import ensure_schema


async def main():
    added = await ensure_schema()
    if added:
        print("Added fields:", ", ".join(added))
    else:
        print("Schema already up to date.")


if __name__ == "__main__":
    asyncio.run(main())