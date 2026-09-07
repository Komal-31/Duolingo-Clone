from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.curriculum_service import CurriculumService
from app.services.lesson_engine_service import LessonEngineService
from app.schemas.lesson import (
    LessonDetailResponse,
    StartLessonResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    CompleteLessonRequest,
    CompleteLessonResponse,
)

router = APIRouter(prefix="/api", tags=["Lessons & Exercises"])


@router.get("/lessons/{id}", response_model=LessonDetailResponse)
def get_lesson(
    id: int,
    db: Session = Depends(get_db)
):
    """Retrieve lesson details including its list of interactive exercises."""
    service = CurriculumService(db)
    return service.get_lesson_by_id(lesson_id=id)


@router.post("/lessons/{id}/start", response_model=StartLessonResponse)
def start_lesson(
    id: int,
    user_id: int = Query(default=1, description="ID of the user starting the lesson"),
    db: Session = Depends(get_db)
):
    """Start a lesson attempt: checks hearts, returns exercises and an active attempt ID."""
    service = LessonEngineService(db)
    return service.start_lesson(user_id=user_id, lesson_id=id)


@router.post("/lessons/{id}/complete", response_model=CompleteLessonResponse)
def complete_lesson(
    id: int,
    body: Optional[CompleteLessonRequest] = None,
    attempt_id: Optional[int] = Query(default=None, description="Optional attempt ID"),
    user_id: int = Query(default=1, description="ID of the user"),
    db: Session = Depends(get_db)
):
    """Finalize lesson completion: awards XP & gems, advances streak, updates leaderboard, and unlocks next lesson."""
    service = LessonEngineService(db)
    resolved_attempt_id = attempt_id or (body.attempt_id if body else None)
    return service.complete_lesson(
        user_id=user_id,
        lesson_id=id,
        attempt_id=resolved_attempt_id
    )


@router.post("/exercises/{id}/answer", response_model=SubmitAnswerResponse)
def answer_exercise(
    id: int,
    body: SubmitAnswerRequest,
    user_id: int = Query(default=1, description="ID of the user"),
    db: Session = Depends(get_db)
):
    """Submit an answer to an exercise, deduct hearts on mistake, and return correctness explanation."""
    service = LessonEngineService(db)
    return service.answer_exercise(
        user_id=user_id,
        exercise_id=id,
        user_answer=body.user_answer,
        attempt_id=body.attempt_id
    )


# Backward-compatible routes for attempts
@router.post("/lessons/{lesson_id}/attempts/{attempt_id}/submit", response_model=SubmitAnswerResponse)
def submit_exercise_attempt(
    lesson_id: int,
    attempt_id: int,
    body: SubmitAnswerRequest,
    user_id: int = Query(default=1, description="ID of the user"),
    db: Session = Depends(get_db)
):
    """Submit an answer for an exercise within a specific attempt ID."""
    service = LessonEngineService(db)
    exercise_id = body.exercise_id or 1
    return service.submit_exercise(
        user_id=user_id,
        lesson_id=lesson_id,
        attempt_id=attempt_id,
        exercise_id=exercise_id,
        user_answer=body.user_answer
    )


@router.post("/lessons/{lesson_id}/attempts/{attempt_id}/complete", response_model=CompleteLessonResponse)
def complete_lesson_attempt(
    lesson_id: int,
    attempt_id: int,
    user_id: int = Query(default=1, description="ID of the user"),
    db: Session = Depends(get_db)
):
    """Complete a lesson via specific attempt ID."""
    service = LessonEngineService(db)
    return service.complete_lesson(
        user_id=user_id,
        lesson_id=lesson_id,
        attempt_id=attempt_id
    )
