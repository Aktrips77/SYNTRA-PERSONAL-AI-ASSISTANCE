import logging

from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings, get_settings
from app.models import ChatRequest, ChatResponse
from app.services.ai_service import AIService, AIServiceError

logger = logging.getLogger("syntra.chat")
router = APIRouter(prefix="/api", tags=["chat"])


def get_ai_service(settings: Settings = Depends(get_settings)) -> AIService:
    return AIService(settings)


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, ai_service: AIService = Depends(get_ai_service)) -> ChatResponse:
    try:
        reply = await ai_service.generate_reply(payload.message, payload.conversation)
        return ChatResponse(response=reply)
    except AIServiceError as exc:
        logger.warning("AI service error: %s", exc.message)
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    except Exception:  # noqa: BLE001 - never leak internals to the client
        logger.exception("Unhandled error while generating a reply")
        raise HTTPException(status_code=500, detail="Something went wrong on our side. Please try again.")
