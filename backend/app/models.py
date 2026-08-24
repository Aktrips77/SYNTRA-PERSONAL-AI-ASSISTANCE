"""Request / response schemas for the SYNTRA API."""

from typing import Literal
from pydantic import BaseModel, Field, field_validator


class ConversationTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    conversation: list[ConversationTurn] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def message_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("message cannot be empty or whitespace only")
        return value


class ChatResponse(BaseModel):
    response: str


class ErrorResponse(BaseModel):
    detail: str
