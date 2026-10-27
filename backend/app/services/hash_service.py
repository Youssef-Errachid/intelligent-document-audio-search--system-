import hashlib


def sha256_bytes(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def normalize_text(text: str) -> str:
    """Lowercase and collapse all whitespace so tiny formatting changes do not change the hash."""
    return " ".join(text.lower().split())


def sha256_text(text: str) -> str:
    return sha256_bytes(normalize_text(text).encode("utf-8"))