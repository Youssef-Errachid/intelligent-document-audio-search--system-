import asyncio

from app.database import client
from app.indexation.indexer import index_all


async def main():
    documents, chunks = await index_all()
    print(f"Indexed {documents} documents into {chunks} chunks.")
    await client.close()


if __name__ == "__main__":
    asyncio.run(main())