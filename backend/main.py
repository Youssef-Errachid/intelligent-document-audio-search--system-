from fastapi import FastAPI

app = FastAPI(title="Intelligent Document & Audio Search")


@app.get("/")
def root():
    return {"message": "API is running"}


@app.get("/search")
def search(q: str):
    return {"query": q, "results": []}