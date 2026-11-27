from app.indexation.solr_service import ensure_schema
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI

from app.auth.dependencies import get_current_user
from app.database import client, database
from app.routers import assistant, audio, auth, documents, health, search

@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    print("Connected to MongoDB")

    await database["users"].create_index("email", unique=True)
    await database["refresh_tokens"].create_index("token_hash", unique=True)
    await database["refresh_tokens"].create_index("expires_at", expireAfterSeconds=0)

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
app.include_router(auth.router, prefix="/api")

protected = [Depends(get_current_user)]
app.include_router(search.router, prefix="/api", dependencies=protected)
app.include_router(documents.router, prefix="/api", dependencies=protected)
app.include_router(audio.router, prefix="/api", dependencies=protected)
app.include_router(assistant.router, prefix="/api", dependencies=protected)


@app.get("/")
def root():
    return {"message": "API is running"}
