# Intelligent Document & Audio Search

An intelligent document and audio search system. It extracts text from documents, transcribes audio, indexes everything in Solr (keywords + embeddings), and lets users search by keywords, by meaning, or both (hybrid) and get results with their source (file, and timestamp for audio). RAG answers with an LLM are the next stage.

## Architecture

The system is built in three stages, and the backend code is organized by these stages:

| Stage | Goal | Backend package | Status |
|---|---|---|---|
| 1. Extraction | Turn files into clean text + metadata, detect duplicates, store in MongoDB | `app/extraction/` | Implemented |
| 2. Indexation | Chunking, embeddings (Ollama) and a Solr index (BM25 + dense vectors) | `app/indexation/` | Implemented |
| 3. Retrieval | Keyword / semantic / hybrid search, then RAG answers | `app/routers/search.py` (`app/retrieval/` is empty) | Search implemented, RAG planned |

### Data flow

```text
Upload (PDF/DOCX/TXT/CSV/XML or audio)
   -> Extraction (Tika or ffmpeg + faster-whisper)
   -> MongoDB (status "extrait")
   -> Chunking -> Embeddings (Ollama) -> Solr (status "indexe")
   -> GET /api/search  (keyword | semantic | hybrid)
```

Indexing runs right after each upload. If it fails (for example Ollama is down), the upload still succeeds and the document keeps the status `extrait`; run `scripts.index_all` later to index it.

## Project Structure

```text
intelligent-document-audio-search--system-/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, lifespan (MongoDB ping + Solr schema), routers
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
│   │   ├── indexation/          # STAGE 2
│   │   │   ├── chunker.py            # Text and audio-segment chunking
│   │   │   ├── embedding_service.py  # Ollama /api/embed client
│   │   │   ├── solr_service.py       # Solr schema, update and search calls
│   │   │   └── indexer.py            # MongoDB document -> Solr chunks
│   │   ├── retrieval/           # STAGE 3 (empty, planned for RAG)
│   │   └── routers/             # HTTP layer: health, search, documents, audio
│   ├── scripts/
│   │   ├── seed.py              # Inserts sample documents
│   │   ├── setup_solr.py        # Creates / checks the Solr schema
│   │   └── index_all.py         # Rebuilds the whole Solr index from MongoDB
│   ├── models/                  # Local Whisper model (not committed)
│   └── requirements.txt
├── frontend/                    # React 19 + Vite + Tailwind CSS 4
├── docs/                        # Project documentation and architecture
└── tests/                       # Automated tests
```

## Tech Stack

- **Backend:** Python 3.12, FastAPI, Uvicorn, PyMongo (async), Pydantic Settings, httpx
- **Frontend:** React 19, Vite, Tailwind CSS 4 (via `@tailwindcss/vite`), React Router, Axios, Motion, lucide-react
- **Database:** MongoDB 8
- **Document text extraction:** Apache Tika Server (with OCR through the `latest-full` image)
- **Audio:** ffmpeg (decoding for hashing), faster-whisper (CTranslate2, CPU, `int8`), PyAV
- **Search index:** Apache Solr (BM25 on text + `DenseVectorField` for KNN)
- **Embeddings:** Ollama with `granite-embedding:278m` (768 dimensions)
- **Planned:** LLM served by Ollama for RAG answers, LangChain/LlamaIndex (optional)

## Prerequisites

- Git
- Python 3.12 with `python3-venv`
- Node.js and npm
- Docker (to run MongoDB, Apache Tika and Solr)
- Ollama (to compute embeddings)
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

### 3. Solr

The backend expects a Solr **core named `documents`** at `http://localhost:8983/solr/documents` (configurable with `SOLR_URL`). The core must support `DenseVectorField` (Solr 9.0 or newer).

Example with a single Docker command (adapt the image tag to the Solr version you use):

```bash
docker run -d --name solr --restart unless-stopped \
  -p 127.0.0.1:8983:8983 \
  -v solr_data:/var/solr \
  solr:9 solr-precreate documents
```

You do not have to write the schema by hand. The backend creates the missing field types and fields when it starts, and you can also run it manually (it is safe to run many times):

```bash
cd backend
python -m scripts.setup_solr
```

The schema created for the `documents` core:

| Field | Type | Notes |
|---|---|---|
| `doc_id` | string | MongoDB `_id` of the parent document |
| `source_path` | string | Original file name |
| `doc_type` | string | `pdf`, `docx`, `txt`, `csv`, `xml`, `audio` |
| `language` | string | Detected language (audio) |
| `chunk_index` | pint | Position of the chunk in the document |
| `start_time`, `end_time` | pfloat | Audio chunks only, in seconds |
| `content` | `text_fr_en` | Custom type: lowercase, French and English stop words, elision, accent folding |
| `vector` | `knn_vector_768` | Dense vector, cosine similarity, indexed but not stored |

The vector dimension comes from `EMBEDDING_DIMENSION` and must match the embedding model.

If the setup script reports a **mismatched field** (a field already exists with another type), Solr cannot change it safely. Rebuild the Solr core (and only Solr, the Ollama models are kept), run `setup_solr` again, then `scripts.index_all`. The backend refuses to start while a mismatch exists.

### 4. Ollama (embeddings)

```bash
ollama pull granite-embedding:278m
```

Ollama listens on `http://localhost:11434` by default (`OLLAMA_URL`). If you change `EMBEDDING_MODEL`, set `EMBEDDING_DIMENSION` to the dimension of the new model, rebuild the Solr core, and re-index.

### 5. Backend

Run the following commands from the project root:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m scripts.seed
python -m scripts.index_all
uvicorn app.main:app --reload --port 8000
```

- `python -m scripts.seed` inserts three sample documents (PDF, DOCX, and audio) into MongoDB. It can be run multiple times without creating duplicates.
- `python -m scripts.index_all` rebuilds the whole Solr index from MongoDB (chunks + embeddings). Use it after the seed, after changing the chunking or the embedding model, or to index documents whose upload-time indexing failed.
- On startup the backend pings MongoDB and checks/creates the Solr schema. If Solr is unreachable, the app does not start.

#### Backend environment variables

Configure these variables in `backend/.env`. This file must not be committed to Git.

| Variable | Example | Notes |
|---|---|---|
| `MONGODB_URL` | `mongodb://localhost:27017` | Required |
| `DATABASE_NAME` | `intelligent_search` | Required |
| `TIKA_URL` | `http://localhost:9998` | Default: `http://localhost:9998` |
| `WHISPER_MODEL_PATH` | `models/whisper-base` | Default: `models/whisper-base` (path relative to `backend/`) |
| `SOLR_URL` | `http://localhost:8983/solr/documents` | Default: same value |
| `OLLAMA_URL` | `http://localhost:11434` | Default: same value |
| `EMBEDDING_MODEL` | `granite-embedding:278m` | Default: same value |
| `EMBEDDING_DIMENSION` | `768` | Default: `768`; must match the model |

The API is available at `http://localhost:8000`, with interactive documentation at `http://localhost:8000/docs`.

### 6. Audio Transcription Setup

The transcriber (`backend/app/extraction/audio/transcriber.py`) uses faster-whisper and is loaded with `local_files_only=True`, so the model must be available locally before the first audio upload. The `models/` folder is ignored by Git.

#### Download the Whisper `base` model

From `backend/`, with the virtual environment active:

```bash
hf download Systran/faster-whisper-base --local-dir models/whisper-base
```

If `hf` is not available, install it with `pip install -U huggingface_hub`. The folder should contain `model.bin`, `config.json`, `tokenizer.json`, and `vocabulary.txt`.

The default `WHISPER_MODEL_PATH` is `models/whisper-base`, so no extra configuration is needed after this download. The path is relative to `backend/`: start `uvicorn` from that folder.

A Hugging Face login (`hf auth login`) is not required for this public model. If you ever use a restricted model:

- A Hugging Face token authenticates access to Hugging Face resources; it does not perform transcription.
- Never put tokens in frontend code, commit them to Git, or share them in logs or screenshots.
- If a token has been exposed, revoke it and create a replacement.

#### Current transcription configuration

- Model: Whisper `base`, loaded once and cached (`lru_cache`)
- Device: CPU, `compute_type="int8"`, `cpu_threads=4`
- Decoding: `beam_size=1`
- VAD (skip silence): **optional, chosen per upload** (`vad` form field, off by default, also available as a checkbox on the upload page)
- Output: full text, detected language, and timestamped segments (`start`, `end`, `text`)

The source of truth is always the code in `transcriber.py`.

#### Dependencies note

`requirements.txt` pins versions that work together (for example `faster-whisper==1.2.1` and `av==16.1.0`). Do not upgrade `av` on its own: a newer PyAV (for example `19.0.2`) was found to be incompatible with the installed faster-whisper version.

### 7. Frontend

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
- Flow: validate extension and size, compute the file SHA-256, send the bytes to Tika, compute the normalized-text SHA-256, store the result in MongoDB, then index it in Solr

### Audio: `POST /api/audio/upload`

- Accepted extensions: `.wav`, `.mp3`, `.m4a`, `.flac`, `.ogg`, `.aac`, `.wma`, `.mp4`, `.mpeg`, `.mpga`, `.opus`, `.webm`
- Maximum size: **50 MB**
- Optional form field: `vad` (boolean, default `false`)
- Flow: validate, compute the file SHA-256, decode to 16 kHz mono PCM with ffmpeg and hash it, transcribe with faster-whisper, store text and timestamped segments in MongoDB, then index it in Solr

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
| `metadata` | Size, MIME type, pages, origin, `vad` (audio), etc. |
| `segments` | `[{start, end, text}]` for audio, empty for documents |
| `status` | `extrait` (text extracted) or `indexe` (indexed in Solr) |
| `indexed_at` | UTC date of the last indexing |
| `created_at` | UTC creation date |

## Indexation Pipeline

### Chunking (`chunker.py`)

Search works on **chunks**, not on whole documents (maximum 800 characters each).

- **Documents:** split by paragraphs, then by words when a paragraph is longer than the limit; small paragraphs are packed together.
- **Audio:** consecutive Whisper segments are grouped, and each chunk keeps its `start_time` and `end_time`, so a result can point to the exact moment in the recording.

Each chunk becomes one Solr document with the id `<doc_id>_<chunk_index>`.

### Embeddings (`embedding_service.py`)

Chunks are embedded by Ollama (`/api/embed`) in batches of 16. The service checks that the number of vectors and their dimension match the configuration, and raises an `EmbeddingError` otherwise.

### Re-indexing

- Uploading a document replaces its chunks in Solr (delete by `doc_id`, then add).
- `python -m scripts.index_all` deletes everything, adds all chunks in batches, and commits once. This is much faster than deleting and committing document by document.

## Search

`GET /api/search?q=...&mode=...&limit=...`

| Mode | How it works |
|---|---|
| `keyword` (API default) | BM25 on `content` (edismax). Best for names, codes and IDs. |
| `semantic` | The query is embedded and the nearest chunks are found with KNN (cosine). Finds related ideas, even with other words or in another language. |
| `hybrid` | Runs both searches and merges them with Reciprocal Rank Fusion (`1 / (60 + rank)`), using ranks and not raw scores. |

Details:

- Results are **collapsed by document**: only the best chunk of each document is returned.
- `q` must have at least 2 characters; `limit` is between 1 and 50.
- Each result has `id`, `source_path`, `type`, `snippet`, `start`, `end` (audio only), and `score`. The snippet is cut around the first query word found (accents ignored); with semantic search the words may be absent, so the start of the chunk is shown.
- If Ollama is down, `hybrid` falls back to keyword search and the response `mode` says `keyword`. The frontend shows a notice when the mode used differs from the mode requested.
- `semantic` returns `503` when embeddings are unavailable, and any mode returns `503` when Solr is unreachable.

## API

| Endpoint | Description | Status |
|---|---|---|
| `GET /api/health` | Service status | Done |
| `GET /api/search?q=...&mode=keyword\|semantic\|hybrid` | Search with source and audio timestamps | Done |
| `GET /api/documents` | Paginated document list with `type` filter (`skip`, `limit` 1–100) | Done |
| `POST /api/documents` | Upload a document, extract its text with Tika, index it | Done |
| `POST /api/audio/upload` | Upload audio, transcribe, store and index it (optional `vad`) | Done; needs more validation on different audio samples |
| `GET /api/documents/{id}` | Document details and segments | Planned |
| `POST /api/ask` | RAG answer with sources | Planned |

## Frontend

| Route | Page | Status |
|---|---|---|
| `/` | Dashboard with action cards | Done |
| `/search` | Search bar, mode toggle (Hybrid / Keywords / Meaning), results with audio time ranges | Done |
| `/documents` | Paginated library with type filter | Done |
| `/upload/documents` | Multi-file upload queue (files processed one after another, retry, pagination) | Done |
| `/audio` | Audio library with transcript preview and filename filter | Done |
| `/audio/upload` | Multi-file audio queue with a "Skip silence (VAD)" option | Done |
| `/assistant` | AI assistant | Placeholder |
| `/settings` | Settings | Placeholder |

Many component and util files (`components/assistant`, `components/audio`, `utils/`, etc.) are still empty placeholders.

## Troubleshooting

**Backend does not start (`SolrError` or `Solr schema has mismatched fields`)**: Solr is not running, the core `documents` does not exist, or an existing field has another type. Check `curl http://localhost:8983/solr/documents/schema/fields`, then follow the rebuild steps in the Solr section.

**`503` on search**: Solr is unreachable, or (for `semantic`) Ollama is unreachable. Check `docker ps` and `curl http://localhost:11434/api/tags`.

**`Model returned N dimensions, but embedding_dimension is 768`**: `EMBEDDING_DIMENSION` does not match `EMBEDDING_MODEL`. Fix `.env`, rebuild the Solr core, and run `scripts.index_all`.

**A document is stuck on `extrait`**: indexing failed during the upload (see the backend logs). Fix the cause and run `python -m scripts.index_all`.

**Hybrid search shows "Meaning search is unavailable"**: Ollama is down, the results are keyword-only.

**`422` with `No speech detected in the audio file`**: the transcription returned no text.

1. Test with a short audio file containing clear speech.
2. Verify that the file is valid and contains audible speech.
3. Compare the result with and without the "Skip silence (VAD)" option (very quiet speech can be removed by VAD).
4. Inspect the backend logs for the complete exception.
5. Confirm that the installed versions of faster-whisper and PyAV are compatible.

**Whisper model not found on audio upload**: the model is loaded with `local_files_only=True`, so `models/whisper-base` must exist and contain `model.bin`, `config.json`, `tokenizer.json` and `vocabulary.txt`. Download it with the `hf download` command in the audio setup section, and start `uvicorn` from `backend/` because the path is relative.

**`422` with `The audio file could not be decoded`**: ffmpeg is missing or cannot read the file. Check `ffmpeg -version`.

**`502` on document upload**: Tika is unreachable. Check `docker ps` and `curl http://localhost:9998/tika`.

A successful HTTP response does not always mean a new transcription occurred: a duplicate upload returns the existing document.

## Current Development Status

Completed:
- FastAPI backend and React/Vite frontend setup
- Backend organized by pipeline stage (`extraction/`, `indexation/`, `retrieval/`)
- MongoDB integration and paginated document listing
- Document extraction with Tika (upload endpoint)
- Audio transcription with faster-whisper (local model, optional VAD)
- Duplicate detection with SHA-256 hashes (file, normalized text, decoded audio)
- Chunking (text and timestamped audio segments)
- Embeddings with Ollama and Solr index (BM25 + dense vectors), automatic schema setup
- Keyword, semantic and hybrid (RRF) search with keyword fallback
- React search page connected to the real API, document and audio libraries, multi-file upload queues

Next steps:
- RAG answers with an Ollama LLM and source references (`POST /api/ask`, `app/retrieval/`)
- AI Assistant page in the frontend
- Document details page and `GET /api/documents/{id}`
- Move upload logic out of the routers into the `extraction/` package
- Language detection for documents (currently `null`)
- Compare Whisper with Wav2Vec2 by WER
- Automated tests for uploads, transcription, indexing and search

## License

To be determined.
