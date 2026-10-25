from fastapi import FastAPI
from app.routers import health, search

app = FastAPI(title="Intelligent Document & Audio Search")

app.include_router(health.router, prefix="/api")
app.include_router(search.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "API is running"}


