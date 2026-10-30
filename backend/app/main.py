from contextlib import asynccontextmanager
pp/routers/documents.py

pp/routers/documents.py
from fastapi import FastAPI
pp/routers/documents.py

pp/routers/documents.py
from app.database import client
pp/routers/documents.py
from app.routers import audio, documents, health, search
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
@asynccontextmanager
pp/routers/documents.py
async def lifespan(app: FastAPI):
pp/routers/documents.py
    await client.admin.command("ping")
pp/routers/documents.py
    print("Connected to MongoDB")
pp/routers/documents.py
    yield
pp/routers/documents.py
    await client.close()
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
app = FastAPI(
pp/routers/documents.py
    title="Intelligent Document & Audio Search",
pp/routers/documents.py
    lifespan=lifespan,
pp/routers/documents.py
)
pp/routers/documents.py

pp/routers/documents.py
app.include_router(health.router, prefix="/api")
pp/routers/documents.py
app.include_router(search.router, prefix="/api")
pp/routers/documents.py
app.include_router(documents.router, prefix="/api")
pp/routers/documents.py
app.include_router(audio.router, prefix="/api")
pp/routers/documents.py

pp/routers/documents.py

pp/routers/documents.py
@app.get("/")
pp/routers/documents.py
def root():
pp/routers/documents.py
    return {"message": "API is running"}
pp/routers/documents.py
