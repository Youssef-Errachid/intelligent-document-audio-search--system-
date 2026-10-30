from fastapi import APIRouter
pp/routers/documents.py

pp/routers/documents.py
router = APIRouter(tags = ["health"])
pp/routers/documents.py

pp/routers/documents.py
@router.get("/health")
pp/routers/documents.py
def health():
pp/routers/documents.py
    return {"status": "ok, it healthy"}
pp/routers/documents.py
