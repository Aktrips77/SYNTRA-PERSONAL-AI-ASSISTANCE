"""Task REST API routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import Task
from app.schemas import TaskCreate, TaskResponse, TaskUpdate


router = APIRouter(prefix="/api/tasks", tags=["tasks"])
DbSession = Annotated[Session, Depends(get_db)]


def get_task_or_404(task_id: int, db: Session) -> Task:
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, db: DbSession) -> Task:
    task = Task(**payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=list[TaskResponse])
def list_tasks(db: DbSession) -> list[Task]:
    statement = select(Task).order_by(Task.created_at.desc(), Task.id.desc())
    return list(db.scalars(statement).all())


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: DbSession) -> Task:
    return get_task_or_404(task_id, db)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: DbSession) -> Task:
    task = get_task_or_404(task_id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: DbSession) -> Response:
    task = get_task_or_404(task_id, db)
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)