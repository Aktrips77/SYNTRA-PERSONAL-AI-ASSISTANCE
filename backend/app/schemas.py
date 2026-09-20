"""Pydantic schemas for the Task REST API."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskCreate(BaseModel):
    """Data accepted when creating a task."""

    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    priority: str = Field(default="medium", min_length=1, max_length=50)
    due_date: datetime | None = None

    @field_validator("title", "priority")
    @classmethod
    def required_text_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class TaskUpdate(BaseModel):
    """Fields that may be changed on an existing task."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    completed: bool | None = None
    priority: str | None = Field(default=None, min_length=1, max_length=50)
    due_date: datetime | None = None

    @field_validator("title", "priority")
    @classmethod
    def optional_text_not_blank(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("must not be null")
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value


class TaskResponse(BaseModel):
    """A task returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    completed: bool
    priority: str
    due_date: datetime | None
    created_at: datetime