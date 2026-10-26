# Intelligent Document & Audio Search

An intelligent document and audio search system that extracts text
from documents, transcribes audio, and enables full-text and semantic
search using Retrieval-Augmented Generation (RAG) and Large Language
Models (LLMs).

## Project Structure

- `backend/` - Backend application and API.
- `frontend/` - Frontend application and user interface.
- `docs/` - Project documentation and architecture.
- `tests/` - Automated tests.

## Tech Stack

- Backend: Python 3.12, FastAPI, Uvicorn, pymongo, pydantic-settings
- Frontend: React 19, Vite, Tailwind CSS 4
- Database: MongoDB

## Prerequisites

- Git
- Python 3.12 (with `python3-venv`)
- Node.js and npm
- Docker (to run MongoDB)

## Run Locally

### 1. MongoDB (Docker)

```bash
docker run -d --name mongo-dev --restart unless-stopped \
  -p 127.0.0.1:27017:27017 \
  -v mongo_data:/data/db \
  mongo:8.0
```

On Linux kernel 6.19 or newer, MongoDB 8.x refuses to start
(see MongoDB issue SERVER-121912). An unofficial workaround is to add
`-e GLIBC_TUNABLES=glibc.pthread.rseq=1` to the command above.
Check your kernel with `uname -r`.

### 2. Backend

Always run these commands from the `backend/` folder:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m scripts.seed
uvicorn app.main:app --reload --port 8000
```

`python -m scripts.seed` inserts 3 sample documents (pdf, docx, audio)
into MongoDB. It can be run several times without creating duplicates.

Environment variables (`backend/.env`, never committed):

| Variable | Example |
|---|---|
| `MONGODB_URL` | `mongodb://localhost:27017` |
| `DATABASE_NAME` | `intelligent_search` |

The API is available at `http://localhost:8000`, and the interactive
documentation at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`. Vite proxies `/api` to the
backend on port 8000.

## API

| Endpoint | Description | Status |
|---|---|---|
| `GET /api/health` | Service status | Done |
| `GET /api/search?q=...&mode=keyword` | Keyword search with source and audio timestamps | Done (regex, temporary) |
| `GET /api/search?mode=semantic\|hybrid` | Semantic and hybrid search | Not implemented (501) |
| `POST /api/ask` | RAG answer with sources | Planned |
| `GET /api/documents/{id}` | Document details and segments | Planned |

## Status

🚧 Under development.

## License

To be determined.
