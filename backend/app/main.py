from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.database import client
from app.routers import documents, health, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    await client.admin.command("ping")
    print("Connected to MongoDB")
    yield
    await client.close()


app = FastAPI(
    title="Intelligent Document & Audio Search",
    lifespan=lifespan,
)

app.include_router(health.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(documents.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "API is running"}