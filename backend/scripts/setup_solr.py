import asyncio

from app.indexation.solr_service import ensure_schema

REBUILD_STEPS = """Rebuild the Solr core (only Solr, the Ollama models are kept):
  docker compose rm -sf solr
  docker volume rm intelligent-document-audio-search--system-_solr_data
  docker compose up -d solr
then run this script again and scripts.index_all."""


async def main():
    result = await ensure_schema()

    if result["added"]:
        print("Added:", ", ".join(result["added"]))

    if result["mismatched"]:
        print("WARNING: these fields exist with another type:", ", ".join(result["mismatched"]))
        print(REBUILD_STEPS)

    if not result["added"] and not result["mismatched"]:
        print("Schema already up to date.")


if __name__ == "__main__":
    asyncio.run(main())