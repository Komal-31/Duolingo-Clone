import string
from datetime import date, datetime, timedelta, timezone
from typing import Any, List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.lesson_repository import LessonRepository
from app.repositories.user_repository import UserRepository
from app.repositories.course_repository import CourseRepository
from app.schemas.lesson import (
    ExerciseResponse,
    StartLessonResponse,
    SubmitAnswerResponse,
    CompleteLessonResponse,
)


def normalize_text(text: Any) -> str:
    """Normalize text by stripping whitespace, punctuation, accents where appropriate, and lowercasing."""
    if text is None:
        return ""
    if not isinstance(text, str):
        text = str(text)
    translator = str.maketrans("", "", string.punctuation + "¿¡।॥")
    return text.translate(translator).strip().lower()


def compute_streak(
    current_streak: int,
    last_streak_date: Optional[date],
    today: date,
) -> tuple[int, date]:
    """
    Pure function: compute new streak given current state and 'today'.
    Returns (new_streak_count, new_last_streak_date).

    Rules:
    - Same day: no change (idempotent).
    - Yesterday: increment streak.
    - Gap > 1 day: reset to 1.
    """
    if last_streak_date == today:
        # Same-day repeat — do not double-count
        return current_streak, last_streak_date

    yesterday = today - timedelta(days=1)
    if last_streak_date == yesterday:
        return current_streak + 1, today
    else:
        # Either first activity ever (last_streak_date is None) or a gap > 1 day
        return 1, today


class LessonEngineService:
    def __init__(self, db: Session):
        self.db = db
        self.lesson_repo = LessonRepository(db)
        self.user_repo = UserRepository(db)
        self.course_repo = CourseRepository(db)

    def start_lesson(self, user_id: int, lesson_id: int) -> StartLessonResponse:
        lesson = self.lesson_repo.get_lesson_by_id(lesson_id)
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson {lesson_id} not found"
            )

        user_stats = self.user_repo.get_or_create_user_stats(user_id)
        if user_stats.current_hearts <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Out of hearts! Refill hearts with gems or practice to continue."
            )

        # Create attempt
        attempt = self.lesson_repo.create_attempt(
            user_id=user_id,
            lesson_id=lesson_id,
            hearts=user_stats.current_hearts
        )

        exercises = self.lesson_repo.get_exercises_for_lesson(lesson_id)
        exercises_response = [
            ExerciseResponse(
                id=ex.id,
                lesson_id=ex.lesson_id,
                type=ex.type,
                prompt=ex.prompt,
                content=ex.content,
                order_index=ex.order_index
            )
            for ex in exercises
        ]

        self.db.commit()

        return StartLessonResponse(
            attempt_id=attempt.id,
            lesson_id=lesson.id,
            lesson_title=lesson.title,
            hearts_remaining=attempt.hearts_remaining,
            xp_reward=lesson.xp_reward,
            exercises=exercises_response
        )

    def validate_answer(self, exercise_type: str, user_ans: Any, correct_ans: Any) -> bool:
        """Validate answer based on exercise type."""
        if exercise_type == "multiple_choice":
            return normalize_text(user_ans) == normalize_text(correct_ans)

        elif exercise_type in ("translate_to_target", "translate_to_source"):
            if isinstance(user_ans, list):
                user_str = " ".join([str(item) for item in user_ans])
            else:
                user_str = str(user_ans)

            if isinstance(correct_ans, list):
                correct_str = " ".join([str(item) for item in correct_ans])
            else:
                correct_str = str(correct_ans)

            return normalize_text(user_str) == normalize_text(correct_str)

        elif exercise_type in ("fill_in_blank", "type_answer"):
            return normalize_text(user_ans) == normalize_text(correct_ans)

        elif exercise_type == "match_pairs":
            if not isinstance(user_ans, dict):
                return False
            if len(user_ans) != len(correct_ans):
                return False
            for k, v in correct_ans.items():
                match = False
                for uk, uv in user_ans.items():
                    if normalize_text(uk) == normalize_text(k) and normalize_text(uv) == normalize_text(v):
                        match = True
                        break
                if not match:
                    return False
            return True

        return normalize_text(user_ans) == normalize_text(correct_ans)

    def answer_exercise(
        self, user_id: int, exercise_id: int, user_answer: Any, attempt_id: Optional[int] = None
    ) -> SubmitAnswerResponse:
        exercise = self.lesson_repo.get_exercise_by_id(exercise_id)
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exercise {exercise_id} not found"
            )

        lesson_id = exercise.lesson_id
        attempt = None
        if attempt_id:
            attempt = self.lesson_repo.get_attempt_by_id(attempt_id)
        if not attempt:
            attempt = self.lesson_repo.get_user_active_attempt(user_id, lesson_id)
        if not attempt:
            user_stats = self.user_repo.get_or_create_user_stats(user_id)
            attempt = self.lesson_repo.create_attempt(user_id, lesson_id, user_stats.current_hearts)

        is_correct = self.validate_answer(exercise.type, user_answer, exercise.correct_answer)
        user_stats = self.user_repo.get_or_create_user_stats(user_id)

        if not is_correct:
            attempt.mistakes_count += 1
            if user_stats.current_hearts > 0:
                user_stats.current_hearts -= 1
            attempt.hearts_remaining = user_stats.current_hearts

            if user_stats.current_hearts <= 0:
                attempt.status = "failed"
                attempt.completed_at = datetime.now(timezone.utc)

        self.db.commit()

        return SubmitAnswerResponse(
            is_correct=is_correct,
            correct_answer=exercise.correct_answer,
            explanation=exercise.explanation,
            hearts_remaining=user_stats.current_hearts,
            is_failed=(user_stats.current_hearts <= 0),
            mistakes_count=attempt.mistakes_count
        )

    def submit_exercise(
        self, user_id: int, lesson_id: int, attempt_id: int, exercise_id: int, user_answer: Any
    ) -> SubmitAnswerResponse:
        attempt = self.lesson_repo.get_attempt_by_id(attempt_id)
        if not attempt or attempt.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Attempt not found or unauthorized"
            )

        if attempt.status != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot submit to attempt with status: {attempt.status}"
            )

        exercise = self.lesson_repo.get_exercise_by_id(exercise_id)
        if not exercise or exercise.lesson_id != lesson_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found for this lesson"
            )

        return self.answer_exercise(user_id, exercise_id, user_answer, attempt_id=attempt_id)

    def complete_lesson(
        self,
        user_id: int,
        lesson_id: int,
        attempt_id: Optional[int] = None,
        _today_override: Optional[date] = None,  # Testable: inject "now" as date
    ) -> CompleteLessonResponse:
        attempt = None
        if attempt_id:
            attempt = self.lesson_repo.get_attempt_by_id(attempt_id)
            if not attempt or attempt.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Attempt not found or unauthorized"
                )
        else:
            attempt = self.lesson_repo.get_user_active_attempt(user_id, lesson_id)
            if not attempt:
                user_stats = self.user_repo.get_or_create_user_stats(user_id)
                attempt = self.lesson_repo.create_attempt(user_id, lesson_id, user_stats.current_hearts)

        if attempt.status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attempt is already completed"
            )

        if attempt.status == "failed" or attempt.hearts_remaining <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot complete a failed attempt with 0 hearts"
            )

        lesson = attempt.lesson
        if not lesson:
            lesson = self.lesson_repo.get_lesson_by_id(lesson_id)
        if not lesson:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Lesson {lesson_id} not found")

        user_stats = self.user_repo.get_or_create_user_stats(user_id)

        # Use injected date for testability, fall back to real today
        today = _today_override if _today_override is not None else date.today()

        # Mark attempt completed
        attempt.status = "completed"
        attempt.completed_at = datetime.now(timezone.utc)
        attempt.xp_earned = lesson.xp_reward

        # Award user XP and Gems
        user_stats.total_xp += lesson.xp_reward
        user_stats.gems += 10

        # Update Daily Activity
        activity = self.user_repo.get_or_create_today_activity(user_id)
        activity.xp_earned += lesson.xp_reward
        activity.lessons_completed += 1
        if activity.xp_earned >= activity.daily_goal_xp:
            activity.goal_reached = True

        # ---- Streak Logic (pure function, testable) ----
        new_streak, new_last_date = compute_streak(
            current_streak=user_stats.streak_count,
            last_streak_date=user_stats.last_streak_date,
            today=today,
        )
        user_stats.streak_count = new_streak
        user_stats.last_streak_date = new_last_date

        if user_stats.streak_count > user_stats.highest_streak:
            user_stats.highest_streak = user_stats.streak_count

        # Update Leaderboard
        week_start = today - timedelta(days=today.weekday())
        lb_entry = self.user_repo.get_or_create_leaderboard_entry(user_id, "Bronze", week_start)
        lb_entry.weekly_xp += lesson.xp_reward

        # Find next lesson in course order & update UserProgress
        course_id = lesson.skill.unit.course_id if lesson.skill and lesson.skill.unit else 1
        ordered_lessons = self.course_repo.get_all_ordered_lessons_for_course(course_id)
        ordered_ids = [l.id for l in ordered_lessons]

        next_lesson_id = None
        if lesson.id in ordered_ids:
            curr_idx = ordered_ids.index(lesson.id)
            if curr_idx + 1 < len(ordered_ids):
                next_lesson_id = ordered_ids[curr_idx + 1]

        progress = self.course_repo.get_user_progress(user_id, course_id)
        completed_count = (progress.completed_lessons_count + 1) if progress else 1
        self.course_repo.create_or_update_progress(
            user_id=user_id,
            course_id=course_id,
            current_lesson_id=next_lesson_id or lesson.id,
            completed_lessons_count=completed_count
        )

        # Check and trigger Achievements
        unlocked_codes: List[str] = []
        all_achievements = self.user_repo.get_all_achievements()

        for ach in all_achievements:
            ua = self.user_repo.get_or_create_user_achievement(user_id, ach.id)
            if not ua.is_unlocked:
                newly_unlocked = False
                if ach.code == "wildfire_streak_3" and user_stats.streak_count >= 3:
                    newly_unlocked = True
                    ua.current_progress = user_stats.streak_count
                elif ach.code == "wildfire_streak_7" and user_stats.streak_count >= 7:
                    newly_unlocked = True
                    ua.current_progress = user_stats.streak_count
                elif ach.code == "scholar_xp_50" and user_stats.total_xp >= 50:
                    newly_unlocked = True
                    ua.current_progress = user_stats.total_xp
                elif ach.code == "scholar_xp_200" and user_stats.total_xp >= 200:
                    newly_unlocked = True
                    ua.current_progress = user_stats.total_xp
                elif ach.code == "flawless_victory" and attempt.mistakes_count == 0:
                    newly_unlocked = True
                    ua.current_progress = 1
                elif ach.code == "gem_collector" and user_stats.gems >= 600:
                    newly_unlocked = True
                    ua.current_progress = user_stats.gems
                else:
                    # Update progress metrics even if not yet unlocked
                    if "streak" in ach.code:
                        ua.current_progress = user_stats.streak_count
                    elif "scholar" in ach.code:
                        ua.current_progress = user_stats.total_xp
                    elif "gem" in ach.code:
                        ua.current_progress = user_stats.gems

                if newly_unlocked:
                    ua.is_unlocked = True
                    ua.unlocked_at = datetime.now(timezone.utc)
                    unlocked_codes.append(ach.title)
                    user_stats.total_xp += ach.xp_reward

        self.db.commit()

        return CompleteLessonResponse(
            status="completed",
            xp_earned=lesson.xp_reward,
            total_xp=user_stats.total_xp,
            current_hearts=user_stats.current_hearts,
            streak_count=user_stats.streak_count,
            daily_goal_xp=activity.daily_goal_xp,
            today_xp=activity.xp_earned,
            daily_goal_reached=activity.goal_reached,
            unlocked_achievements=unlocked_codes,
            next_lesson_id=next_lesson_id
        )
