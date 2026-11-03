MAX_CHARS = 800


def _pack(pieces: list[str], max_chars: int) -> list[str]:
    """Join pieces with spaces into strings of at most max_chars.

    A single piece longer than max_chars is kept as it is.
    """
    packed = []
    current = ""
    for piece in pieces:
        if current and len(current) + 1 + len(piece) > max_chars:
            packed.append(current)
            current = piece
        else:
            current = f"{current} {piece}" if current else piece
    if current:
        packed.append(current)
    return packed


def chunk_text(text: str, max_chars: int = MAX_CHARS) -> list[dict]:
    """Split a document text by paragraphs, then by words if a paragraph is too long."""
    pieces = []
    for paragraph in text.split("\n\n"):
        paragraph = " ".join(paragraph.split())  # collapse spaces and newlines
        if not paragraph:
            continue
        if len(paragraph) > max_chars:
            pieces.extend(_pack(paragraph.split(), max_chars))
        else:
            pieces.append(paragraph)


    return [{"content": content} for content in _pack(pieces, max_chars)]


def chunk_segments(segments: list[dict], max_chars: int = MAX_CHARS) -> list[dict]:
    """Group consecutive audio segments, keeping the time range of each group."""
    chunks = []
    group = []
    length = 0

    for segment in segments:
        text = segment["text"].strip()
        if not text:
            continue
        if group and length + 1 + len(text) > max_chars:
            chunks.append(_group_to_chunk(group))
            group, length = [], 0
        group.append(segment)
        length += len(text) + 1

    if group:
        chunks.append(_group_to_chunk(group))
    return chunks


def _group_to_chunk(group: list[dict]) -> dict:
    return {
        "content": " ".join(segment["text"].strip() for segment in group),
        "start_time": group[0]["start"],
        "end_time": group[-1]["end"],
    }



def chunk_document(doc: dict, max_chars: int = MAX_CHARS) -> list[dict]:
    """Return the chunks of a MongoDB document, each with its chunk_index."""
    segments = doc.get("segments") or []
    if doc.get("type") == "audio" and segments:
        chunks = chunk_segments(segments, max_chars)
    else:
        chunks = chunk_text(doc.get("text", ""), max_chars)

    for index, chunk in enumerate(chunks):
        chunk["chunk_index"] = index
    return chunks