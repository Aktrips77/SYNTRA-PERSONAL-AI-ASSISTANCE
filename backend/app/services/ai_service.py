"""
AI service abstraction.

This module is the ONLY place that knows how to talk to an AI provider.
Today it calls OpenRouter's OpenAI-compatible /chat/completions endpoint,
but routes/services above this layer only depend on `generate_reply()`,
so swapping providers or models later does not require touching the
rest of the application.
"""

import logging

import httpx

from app.config import Settings
from app.models import ConversationTurn

logger = logging.getLogger("syntra.ai_service")

SYSTEM_PROMPT = (
    "You are SYNTRA, a helpful personal AI assistant. "
    "The user may speak to you in English, Hindi, or Hinglish "
    "(a natural mix of Hindi and English). Always reply in the same "
    "language / style the user used in their latest message. "
    "Keep answers clear, friendly, and concise unless more detail is "
    "clearly needed."
)


class AIServiceError(Exception):
    """Raised when the upstream AI provider cannot fulfil a request."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class AIService:
    """Thin, swappable wrapper around an OpenRouter chat completion call."""

    def __init__(self, settings: Settings):
        self._settings = settings

    async def generate_reply(self, message: str, conversation: list[ConversationTurn]) -> str:
        if not self._settings.has_api_key:
            raise AIServiceError(
                "SYNTRA is not configured with an OpenRouter API key. "
                "Set OPENROUTER_API_KEY in backend/.env and restart the server.",
                status_code=503,
            )

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for turn in conversation:
            messages.append({"role": turn.role, "content": turn.content})
        messages.append({"role": "user", "content": message})

        payload = {
            "model": self._settings.openrouter_model,
            "messages": messages,
        }
        headers = {
            "Authorization": f"Bearer {self._settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self._settings.openrouter_site_url,
            "X-Title": self._settings.openrouter_site_name,
        }

        try:
            async with httpx.AsyncClient(timeout=self._settings.ai_request_timeout) as client:
                resp = await client.post(
                    f"{self._settings.openrouter_base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                )
        except httpx.TimeoutException as exc:
            logger.error("OpenRouter request timed out: %s", exc)
            raise AIServiceError("The AI service took too long to respond. Please try again.", 504) from exc
        except httpx.RequestError as exc:
            logger.error("Network error calling OpenRouter: %s", exc)
            raise AIServiceError("Could not reach the AI service. Check your network connection.", 502) from exc

        if resp.status_code == 401:
            raise AIServiceError("The OpenRouter API key is invalid or missing.", 401)
        if resp.status_code == 429:
            raise AIServiceError("Rate limit reached with the AI provider. Please wait and try again.", 429)
        if resp.status_code >= 400:
            logger.error("OpenRouter error %s: %s", resp.status_code, resp.text[:500])
            raise AIServiceError("The AI provider returned an error. Please try again shortly.", 502)

        try:
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, ValueError) as exc:
            logger.error("Unexpected OpenRouter response shape: %s", exc)
            raise AIServiceError("Received an unexpected response from the AI provider.", 502) from exc

        if not content or not content.strip():
            raise AIServiceError("The AI provider returned an empty response.", 502)

        return content.strip()
