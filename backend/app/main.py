from app.indexation.solr_service import ensure_schema
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import client
from app.routers import assistant, audio, documents, health, search

@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    print("Connected to MongoDB")

    schema_result = await ensure_schema()
    print("Solr schema:", schema_result)

    if schema_result["mismatched"]:
        raise RuntimeError(
            f"Solr schema has mismatched fields: {schema_result['mismatched']}"
        )

    print("Solr schema initialized successfully")

    yield
    await client.close()


app = FastAPI(
    title="Intelligent Document & Audio Search",
    lifespan=lifespan,
)

app.include_router(health.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(audio.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "API is running"}
