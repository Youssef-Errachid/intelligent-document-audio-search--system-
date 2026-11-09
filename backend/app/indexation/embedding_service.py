import httpx

from app.config import settings


class EmbeddingError(Exception):
    """Raised when Ollama is unreachable or returns unexpected vectors."""


async def embed(texts: list[str]) -> list[list[float]]:
    """Return one vector per text, in the same order as the input."""
    if not texts:
        return []

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            response = await client.post(
                f"{settings.ollama_url}/api/embed",
                json={"model": settings.embedding_model, "input": texts, "keep_alive": "30m",},
            )
    except httpx.HTTPError as exc:
        raise EmbeddingError("Ollama is unreachable") from exc

    if response.status_code != 200:
        raise EmbeddingError(f"Ollama returned {response.status_code}: {response.text[:300]}")

    vectors = response.json()["embeddings"]

    if len(vectors) != len(texts):
        raise EmbeddingError(f"Expected {len(texts)} vectors, got {len(vectors)}")

    if len(vectors[0]) != settings.embedding_dimension:

        raise EmbeddingError(
            f"Model returned {len(vectors[0])} dimensions, "
            f"but embedding_dimension is {settings.embedding_dimension}"
        )

    return vectors