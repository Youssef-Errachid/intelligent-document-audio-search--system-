import logging

from fastapi import APIRouter, HTTPException

from app.indexation.solr_service import SolrError
from app.retrieval.rag_service import LLMError, answer_question
from app.schemas import AskRequest, AskResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post("/ask", response_model=AskResponse)
async def ask(body: AskRequest):
    try:
        return await answer_question(body.question.strip())
    except LLMError as exc:
        logger.exception("LLM failed: %s", exc)
        raise HTTPException(status_code=503, detail="The assistant is unavailable.") from exc
    except SolrError as exc:
        logger.exception("Solr search failed: %s", exc)
        raise HTTPException(status_code=503, detail="Search service is unavailable.") from exc