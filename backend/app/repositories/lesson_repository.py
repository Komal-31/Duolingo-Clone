from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.lesson import Lesson, Exercise, LessonAttempt


class LessonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_lesson_by_id(self, lesson_id: int) -> Optional[Lesson]:
        return (
            self.db.query(Lesson)
            .options(joinedload(Lesson.exercises), joinedload(Lesson.skill))
            .filter(Lesson.id == lesson_id)
            .first()
        )

    def get_exercise_by_id(self, exercise_id: int) -> Optional[Exercise]:
        return (
            self.db.query(Exercise)
            .options(joinedload(Exercise.lesson))
            .filter(Exercise.id == exercise_id)
            .first()
        )

    def get_exercises_for_lesson(self, lesson_id: int) -> List[Exercise]:
        return (
            self.db.query(Exercise)
            .filter(Exercise.lesson_id == lesson_id)
            .order_by(Exercise.order_index)
            .all()
        )

    def create_attempt(self, user_id: int, lesson_id: int, hearts: int) -> LessonAttempt:
        attempt = LessonAttempt(
            user_id=user_id,
            lesson_id=lesson_id,
            status="in_progress",
            current_exercise_index=0,
            hearts_remaining=hearts,
            xp_earned=0,
            mistakes_count=0
        )
        self.db.add(attempt)
        self.db.flush()
        return attempt

    def get_attempt_by_id(self, attempt_id: int) -> Optional[LessonAttempt]:
        return (
            self.db.query(LessonAttempt)
            .options(joinedload(LessonAttempt.lesson))
            .filter(LessonAttempt.id == attempt_id)
            .first()
        )

    def get_user_active_attempt(self, user_id: int, lesson_id: int) -> Optional[LessonAttempt]:
        return (
            self.db.query(LessonAttempt)
            .filter(
                LessonAttempt.user_id == user_id,
                LessonAttempt.lesson_id == lesson_id,
                LessonAttempt.status == "in_progress"
            )
            .order_by(LessonAttempt.id.desc())
            .first()
        )
