from fastapi import APIRouter

router = APIRouter(tags=["search"])


@router.get("/search")
def search(q: str, mode: str = "keyword"):
    return {"query": q, "mode": mode, "results": []}