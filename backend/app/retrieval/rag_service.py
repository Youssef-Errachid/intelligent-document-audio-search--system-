import httpx

from app.config import settings
from app.retrieval.search_service import hybrid_search

SYSTEM_PROMPT = (
    "You are an assistant that answers questions using ONLY the numbered "
    "passages provided. Rules:\n"
    "- If the passages do not contain the answer, say you could not find it "
    "in the documents. Do not use outside knowledge.\n"
    "- Cite the passages you used with their numbers, like [1] or [2].\n"
    "- Answer in the same language as the question."
)


class LLMError(Exception):
    """Raised when Ollama is unreachable or returns an error."""


def as_text(value) -> str:
    """Solr may return a text field as a list of strings."""
    if isinstance(value, list):
        return " ".join(value)
    return value or ""


def build_context(chunks: list[dict]) -> str:
    """Number the chunks so the model can cite them."""
    parts = []
    for number, chunk in enumerate(chunks, start=1):
        parts.append(f"[{number}] ({chunk['source_path']})\n{as_text(chunk.get('content'))}")
    return "\n\n".join(parts)



def build_sources(chunks: list[dict]) -> list[dict]:
    """The sources returned to the frontend, numbered like in the prompt."""
    return [
        {
            "number": number,
            "id": chunk["doc_id"],
            "source_path": chunk["source_path"],
            "type": chunk["doc_type"],
            "start": chunk.get("start_time"),
            "end": chunk.get("end_time"),
            "excerpt": as_text(chunk.get("content"))[:300],
        }
        for number, chunk in enumerate(chunks, start=1)
    ]


async def call_llm(question: str, context: str) -> str:
    """Ask Ollama to answer the question from the context."""
    payload = {
        "model": settings.llm_model,
        "stream": False,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Passages:\n{context}\n\nQuestion: {question}",
            },
        ],
        "options": {"temperature": 0.2},
    }


    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout) as client:
            response = await client.post(f"{settings.ollama_url}/api/chat", json=payload)
    except httpx.HTTPError as exc:
        raise LLMError("Ollama is unreachable") from exc

    if response.status_code != 200:
        raise LLMError(f"Ollama returned {response.status_code}: {response.text[:300]}")

    return response.json()["message"]["content"].strip()


async def answer_question(question: str) -> dict:
    """Full RAG: retrieve chunks, build the prompt, ask the LLM."""
    chunks, mode = await hybrid_search(question, settings.rag_top_k)

    if not chunks:
        return {
            "answer": "I could not find anything about this in your documents.",
            "mode": mode,
            "sources": [],
        }

    answer = await call_llm(question, build_context(chunks))
    return {"answer": answer, "mode": mode, "sources": build_sources(chunks)}