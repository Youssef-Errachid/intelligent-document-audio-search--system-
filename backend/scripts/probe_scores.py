import asyncio
import sys

from app.indexation.embedding_service import embed
from app.indexation.solr_service import search_vectors


async def main():
    for question in sys.argv[1:]:
        [vector] = await embed([question])
        chunks = await search_vectors(vector, 5)
        print(f"\n{question}")
        for chunk in chunks:
            print(f"  {chunk.get('score', 0):.3f}  {chunk['source_path'][:45]}")


asyncio.run(main())