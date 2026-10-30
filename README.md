# Intelligent Document & Audio Search

An intelligent document and audio search system. It extracts text from documents, transcribes audio, and (in later stages) lets users search by keywords or by meaning and get RAG answers with their sources (file, and timestamp for audio).

## Architecture

The system is built in three stages, and the backend code is organized by these stages:

| Stage | Goal | Backend package | Status |
|---|---|---|---|
| 1. Extraction | Turn files into clean text + metadata, detect duplicates, store in MongoDB | `app/extraction/` | Implemented |
| 2. Indexation | Keyword index (BM25) and embeddings (chunking + vector store) | `app/indexation/` | Planned |
| 3. Retrieval | Keyword / semantic / hybrid search and RAG answers | `app/retrieval/` + `app/routers/` | Keyword search only (temporary regex) |

## Project Structure

```text
intelligent-document-audio-search--system-/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, lifespan, routers registration
│   │   ├── config.py            # Settings loaded from .env (pydantic-settings)
│   │   ├── database.py          # MongoDB client
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── extraction/          # STAGE 1
│   │   │   ├── hash_service.py  # SHA-256 of bytes and of normalized text
│   │   │   ├── documents/
│   │   │   │   └── tika_service.py   # Apache Tika client
│   │   │   └── audio/
│   │   │       ├── fingerprint.py    # Decoded-audio hash (ffmpeg)
│   │   │       ├── loader.py         # Audio file validation
│   │   │       ├── transcriber.py    # faster-whisper transcription
│   │   │       └── pipeline.py       # (empty for now)
│   │   ├── indexation/          # STAGE 2 (planned)
│   │   ├── retrieval/           # STAGE 3 (planned)
│   │   └── routers/             # HTTP layer: health, search, documents, audio
│   ├── scripts/
│   │   └── seed.py              # Inserts sample documents
│   ├── models/                  # Local Whisper model (not committed)
│   └── requirements.txt
├── frontend/                    # React 19 + Vite + Tailwind CSS 4
├── docs/                        # Project documentation and architecture
└── tests/                       # Automated tests
```

## Tech Stack

- **Backend:** Python 3.12, FastAPI, Uvicorn, PyMongo (async), Pydantic Settings, httpx
- **Frontend:** React 19, Vite, Tailwind CSS 4 (via `@tailwindcss/vite`)
- **Database:** MongoDB 8
- **Document text extraction:** Apache Tika Server (with OCR through the `latest-full` image)
- **Audio:** ffmpeg (decoding for hashing), faster-whisper (CTranslate2, CPU, `int8`), PyAV
- **Planned:** Solr/OpenSearch (keyword index), Ollama (embeddings + LLM), a vector store, LangChain/LlamaIndex

## Prerequisites

- Git
- Python 3.12 with `python3-venv`
- Node.js and npm
- Docker (to run MongoDB and Apache Tika)
- ffmpeg (used to compute the decoded-audio hash):

```bash
sudo apt install ffmpeg
```

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

It should answer with a message indicating that Tika Server is running and expects a PUT request. If you get `Connection reset by peer`, wait a few seconds and retry (`docker logs tika --tail 5`).

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

| Variable | Example | Notes |
|---|---|---|
| `MONGODB_URL` | `mongodb://localhost:27017` | Required |
| `DATABASE_NAME` | `intelligent_search` | Required |
| `TIKA_URL` | `http://localhost:9998` | Default: `http://localhost:9998` |
| `WHISPER_MODEL_PATH` | `models/whisper-base` | Default: `models/whisper-base` |

The API is available at `http://localhost:8000`, with interactive documentation at `http://localhost:8000/docs`.

### 4. Audio Transcription Setup

The transcriber (`backend/app/extraction/audio/transcriber.py`) uses faster-whisper with a **local** model folder. It is loaded with `local_files_only=True`, so the model must be downloaded once before the first audio upload. The `models/` folder is ignored by Git.

#### Download the Whisper `base` model

From `backend/`, with the virtual environment active:

```bash
hf download Systran/faster-whisper-base --local-dir models/whisper-base
```

If `hf` is not available, install it with `pip install -U huggingface_hub`. The folder should contain `model.bin`, `config.json`, `tokenizer.json`, and `vocabulary.txt`.

A Hugging Face login (`hf auth login`) is not required for this public model. If you ever use a restricted model:

- A Hugging Face token authenticates access to Hugging Face resources; it does not perform transcription.
- Never put tokens in frontend code, commit them to Git, or share them in logs or screenshots.
- If a token has been exposed, revoke it and create a replacement.

#### Current transcription configuration

- Model: Whisper `base`, loaded once and cached (`lru_cache`)
- Device: CPU, `compute_type="int8"`, `cpu_threads=4`
- Decoding: `beam_size=1`
- `vad_filter=False` (voice activity detection is currently disabled)
- Output: full text, detected language, and timestamped segments (`start`, `end`, `text`)

The source of truth is always the code in `transcriber.py`.

#### Dependencies note

`requirements.txt` pins versions that work together (for example `faster-whisper==1.2.1` and `av==16.1.0`). Do not upgrade `av` on its own: a newer PyAV (for example `19.0.2`) was found to be incompatible with the installed faster-whisper version.

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`. Vite proxies `/api` requests to the backend on port 8000.

## Extraction Pipeline

### Documents: `POST /api/documents`

- Accepted formats: `pdf`, `docx`, `txt`, `csv`, `xml`
- Maximum size: **50 MB**
- Flow: validate extension and size, compute the file SHA-256, send the bytes to Tika, compute the normalized-text SHA-256, store the result in MongoDB

### Audio: `POST /api/audio/upload`

- Accepted extensions: `.wav`, `.mp3`, `.m4a`, `.flac`, `.ogg`, `.aac`, `.wma`, `.mp4`, `.mpeg`, `.mpga`, `.opus`, `.webm`
- Maximum size: **50 MB**
- Flow: validate, compute the file SHA-256, decode to 16 kHz mono PCM with ffmpeg and hash it, transcribe with faster-whisper, store text and timestamped segments in MongoDB

### Duplicate detection ("déjà vu")

| Type | Checks (in order) |
|---|---|
| Document | file SHA-256, then normalized-text SHA-256 |
| Audio | file SHA-256, then decoded-audio SHA-256 |

When a duplicate is found, the API answers `200` with `"duplicate": true` and the existing document instead of creating a new one (new documents answer `201`).

### Stored document schema (MongoDB, collection `documents`)

| Field | Description |
|---|---|
| `source_path` | Original file name |
| `type` | `pdf`, `docx`, `txt`, `csv`, `xml`, or `audio` |
| `hash` | `file`, `text`, and `audio` (audio only) |
| `text` | Extracted or transcribed text |
| `language` | Detected language (audio) or `null` |
| `metadata` | Size, MIME type, pages, origin, etc. |
| `segments` | `[{start, end, text}]` for audio, empty for documents |
| `status` | Processing status (currently `extrait`) |
| `created_at` | UTC creation date |

## API

| Endpoint | Description | Status |
|---|---|---|
| `GET /api/health` | Service status | Done |
| `GET /api/search?q=...&mode=keyword` | Keyword search with source and audio timestamps | Done (regex, temporary) |
| `GET /api/search?mode=semantic` | Semantic search | Not implemented (501) |
| `GET /api/search?mode=hybrid` | Hybrid search | Not implemented (501) |
| `GET /api/documents` | Paginated document list with type filter | Done |
| `POST /api/documents` | Upload a document and extract its text with Tika | Done |
| `POST /api/audio/upload` | Upload audio, transcribe speech, and store the result | Done; needs more validation on different audio samples |
| `GET /api/documents/{id}` | Document details and segments | Planned |
| `POST /api/ask` | RAG answer with sources | Planned |

## Troubleshooting

**`422` with `No speech detected in the audio file`**: the transcription returned no text.

1. Test with a short audio file containing clear speech.
2. Verify that the file is valid and contains audible speech.
3. Try enabling `vad_filter=True` or keeping it `False`, and compare the results.
4. Inspect the backend logs for the complete exception.
5. Confirm that the installed versions of faster-whisper and PyAV are compatible.

**`422` with `The audio file could not be decoded`**: ffmpeg is missing or cannot read the file. Check `ffmpeg -version`.

**`502` on document upload**: Tika is unreachable. Check `docker ps` and `curl http://localhost:9998/tika`.

A successful HTTP response does not always mean a new transcription occurred: a duplicate upload returns the existing document.

## Current Development Status

Completed:
- FastAPI backend and React/Vite frontend setup
- Backend organized by pipeline stage (`extraction/`, `indexation/`, `retrieval/`)
- MongoDB integration and paginated document listing
- Document extraction with Tika (upload endpoint)
- Audio transcription with faster-whisper (local model)
- Duplicate detection with SHA-256 hashes (file, normalized text, decoded audio)
- Temporary keyword search with regex

Next steps:
- Move upload logic out of the routers into the `extraction/` package
- Keyword indexation (BM25) with Solr or OpenSearch
- Chunking, embeddings (Ollama), and a vector store
- Hybrid search and RAG answers with source references
- Connect the React search page to the real API
- Automated tests for uploads, transcription, and search

## License

To be determined.
