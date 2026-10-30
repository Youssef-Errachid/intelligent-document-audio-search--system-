import hashlib
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
def sha256_bytes(content: bytes) -> str:
pp/routers/documents.py
    return hashlib.sha256(content).hexdigest()
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
def normalize_text(text: str) -> str:
pp/routers/documents.py
    """Lowercase and collapse all whitespace so tiny formatting changes do not change the hash."""
pp/routers/documents.py
    return " ".join(text.lower().split())
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
def sha256_text(text: str) -> str:
pp/routers/documents.py
    return sha256_bytes(normalize_text(text).encode("utf-8"))
pp/routers/documents.py
