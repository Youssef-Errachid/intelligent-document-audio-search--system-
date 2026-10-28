# Intelligent Document & Audio Search

An intelligent document and audio search system that extracts text from documents, transcribes audio, and enables full-text and semantic search using Retrieval-Augmented Generation (RAG) and Large Language Models (LLMs).

## Project Structure

- `backend/` - Backend application and API.
- `frontend/` - Frontend application and user interface.
- `docs/` - Project documentation and architecture.
- `tests/` - Automated tests.

## Tech Stack

- **Backend:** Python 3.12, FastAPI, Uvicorn, PyMongo, Pydantic Settings
- **Frontend:** React 19, Vite, Tailwind CSS 4
- **Database:** MongoDB 8
- **Document text extraction:** Apache Tika Server
- **Audio transcription:** faster-whisper, CTranslate2, PyAV
- **Audio model:** Whisper `base`, configured for CPU inference with `int8`
- **Model access:** Hugging Face Hub CLI authentication when required

## Prerequisites

- Git
- Python 3.12 with `python3-venv`
- Node.js and npm
- Docker (to run MongoDB and Apache Tika)
- Hugging Face account and CLI authentication if access to a restricted model is required

## Run Locally

### 1. MongoDB (Docker)

```bash
docker run -d --name mongo-dev --restart unless-stopped \
  -p 127.0.0.1:27017:27017 \
  -v mongo_data:/data/db \
  mongo:8.0
```

On Linux kernel 6.19 or newer, MongoDB 8.x may fail to start due to MongoDB issue SERVER-121912. An unofficial workaround is to add `-e GLIBC_TUNABLES=glibc.pthread.rseq=1` to the command above. Check your kernel with `uname -r`.

### 2. Apache Tika (Docker)

Apache Tika Server converts uploaded documents (PDF, DOCX, CSV, XML, etc.) to text. It runs as a separate REST service on port 9998.

```bash
docker run -d --name tika --restart unless-stopped \
  -p 127.0.0.1:9998:9998 \
  apache/tika:latest-full
```

The `latest-full` image includes OCR support through Tesseract for scanned documents. The first run downloads the image, so it can take a few minutes.

Check that it works:

```bash
curl http://localhost:9998/tika
```

It should answer with a message indicating that Tika Server is running and expects a PUT request. If you get `Connection reset by peer`, wait a few seconds and retry:

```bash
docker logs tika --tail 5
```

Test document extraction:

```bash
curl -T ./path/to/file.pdf \
  http://localhost:9998/tika \
  --header "Accept: text/plain"
```

Audio files are not handled by Tika. They are transcribed separately with faster-whisper.

### 3. Backend

Run the following commands from the project root:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m scripts.seed
uvicorn app.main:app --reload --port 8000
```

`python -m scripts.seed` inserts three sample documents (PDF, DOCX, and audio) into MongoDB. It can be run multiple times without creating duplicates.

#### Backend environment variables

Configure these variables in `backend/.env`. This file must not be committed to Git.

| Variable | Example |
|---|---|
| `MONGODB_URL` | `mongodb://localhost:27017` |
| `DATABASE_NAME` | `intelligent_search` |
| `TIKA_URL` | `http://localhost:9998` |

The API is available at `http://localhost:8000`, with interactive documentation at `http://localhost:8000/docs`.

### 4. Audio Transcription Setup

The audio transcription pipeline uses faster-whisper, a Python implementation of Whisper optimized with CTranslate2.

#### Install dependencies

Ensure `backend/requirements.txt` includes the project's faster-whisper dependency and a compatible PyAV version:

```text
faster-whisper
av>=11,<19
```

Keep the project's existing pinned versions where applicable. The PyAV constraint addresses the compatibility issue encountered with `av==19.0.2` and the installed faster-whisper version.

Install the dependencies inside the active virtual environment:

```bash
python -m pip install -r requirements.txt
```

#### Hugging Face authentication

Hugging Face hosts AI models and provides authentication for resources that require access permissions. If a model requires authentication, sign in using the Hugging Face CLI:

```bash
hf auth login
```

Follow the authentication prompts. Verify the active account with:

```bash
hf auth whoami
```

The CLI stores authentication credentials locally, allowing compatible Hugging Face libraries to reuse the login.

**Important:**
- A Hugging Face token authenticates access to Hugging Face resources; it does not perform audio transcription.
- The Whisper `base` model does not generally require a Hugging Face token for ordinary public-model use.
- Do not put access tokens in frontend code, commit them to Git, or share them in logs or screenshots.
- If a token has been exposed publicly, revoke it and create a replacement.

#### Transcription configuration

The current configuration uses the Whisper `base` model on the CPU with `int8` computation. A typical implementation is:

```python
from functools import lru_cache
from faster_whisper import WhisperModel


@lru_cache(maxsize=1)
def get_model():
    return WhisperModel(
        "base",
        device="cpu",
        compute_type="int8",
        cpu_threads=4,
    )


def transcribe_audio(audio_path: str):
    model = get_model()

    segments, info = model.transcribe(
        audio_path,
        beam_size=1,
        vad_filter=True,
    )

    transcript_segments = []
    text_parts = []

    for segment in segments:
        segment_text = segment.text.strip()

        if segment_text:
            text_parts.append(segment_text)
            transcript_segments.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment_text,
            })

    text = " ".join(text_parts).strip()

    if not text:
        raise ValueError("No speech detected in the audio file.")

    return {
        "text": text,
        "language": info.language,
        "segments": transcript_segments,
    }
```

This is a reference for the current configuration; keep the implementation in `backend/app/audio/transcriber.py` as the source of truth.

#### Audio upload API

The backend exposes the following endpoint:

`POST /api/audio/upload`

The endpoint validates the uploaded file, checks for duplicates using a SHA-256 file hash, temporarily saves the audio, calls the transcription function, and stores the transcript and metadata in MongoDB.

Supported extensions:

- `.wav`
- `.mp3`
- `.m4a`
- `.flac`
- `.ogg`
- `.aac`
- `.wma`

Maximum upload size: **50 MB**.

Transcription records include the extracted text, detected language, timestamped segments, file hash, text hash, metadata, and processing status.

#### Troubleshooting audio transcription

If the API returns `422 Unprocessable Entity` with `No speech detected in the audio file`, the application did not obtain any non-empty transcription text.

Check the following:

1. Test with a short audio file containing clear speech.
2. Verify that the audio file is valid and contains audible speech.
3. Temporarily test with `vad_filter=False` to check whether voice activity detection is filtering out the speech.
4. Inspect the backend logs for the complete exception.
5. Confirm that the installed versions of faster-whisper and PyAV are compatible.

A successful HTTP response does not necessarily mean a new transcription occurred: a duplicate upload may return an existing document.

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. Vite proxies `/api` requests to the backend on port 8000.

## API

| Endpoint | Description | Status |
|---|---|---|
| `GET /api/health` | Service status | Done |
| `GET /api/search?q=...&mode=keyword` | Keyword search with source and audio timestamps | Done (regex, temporary) |
| `GET /api/search?mode=semantic` | Semantic search | Not implemented (501) |
| `GET /api/search?mode=hybrid` | Hybrid search | Not implemented (501) |
| `GET /api/documents` | Paginated document list with type filter | Done |
| `POST /api/documents/upload` | Upload a document and extract its text with Tika | Planned |
| `POST /api/audio/upload` | Upload audio, transcribe speech, and store the result | Implemented; transcription requires further validation |
| `POST /api/ask` | RAG answer with sources | Planned |
| `GET /api/documents/{id}` | Document details and segments | Planned |

## Current Development Status

The project is under development.

Completed or implemented:
- FastAPI backend and React/Vite frontend setup.
- MongoDB integration and document listing.
- Keyword search using a temporary regex implementation.
- Audio upload validation and duplicate-file detection.
- faster-whisper integration for speech-to-text.
- PyAV compatibility adjustment for the current environment.
- Hugging Face CLI authentication configured locally.

Remaining work:
- Validate transcription with different audio samples and languages.
- Resolve cases where no speech is detected.
- Implement document upload and extraction through the API.
- Implement semantic and hybrid search.
- Implement RAG-based question answering with source references.
- Add automated tests for uploads, transcription, and search.

## License

To be determined.
