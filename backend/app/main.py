import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import Base, engine
from app import db_models  # noqa: F401 - register SQLAlchemy table models
from app.routes import chat, tasks

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("syntra.main")

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SYNTRA API",
    description="Backend for SYNTRA — Personal AI Assistant (Phase 1)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "An unexpected error occurred."})


@app.get("/api/health")
async def health() -> dict:
    return {
        "status": "ok",
        "openrouter_configured": settings.has_api_key,
        "model": settings.openrouter_model,
    }


app.include_router(chat.router)
app.include_router(tasks.router)
