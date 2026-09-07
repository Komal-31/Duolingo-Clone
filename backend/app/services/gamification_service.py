from datetime import date, datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.user_repository import UserRepository
from app.repositories.course_repository import CourseRepository
from app.schemas.user import UserResponse, UserProgressSummaryResponse
from app.schemas.stats import UserStatsResponse, RefillHeartsResponse, PracticeResponse, DailyActivityResponse
from app.schemas.gamification import (
    LeaderboardResponse,
    LeaderboardUserItem,
    AchievementItemResponse,
    AchievementsListResponse,
)


class GamificationService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.course_repo = CourseRepository(db)

    def get_user(self, user_id: Optional[int] = None) -> UserResponse:
        if user_id is not None:
            user = self.user_repo.get_user_by_id(user_id)
        else:
            user = self.user_repo.get_default_user()

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.model_validate(user)

    def get_user_stats(self, user_id: Optional[int] = None) -> UserStatsResponse:
        user = self.user_repo.get_user_by_id(user_id) if user_id else self.user_repo.get_default_user()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        stats = self.user_repo.get_or_create_user_stats(user.id)
        return UserStatsResponse.model_validate(stats)

    def get_user_progress(self, user_id: Optional[int] = None, course_id: Optional[int] = None) -> UserProgressSummaryResponse:
        user = self.user_repo.get_user_by_id(user_id) if user_id else self.user_repo.get_default_user()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        course = self.course_repo.get_course_by_id(course_id) if course_id else self.course_repo.get_default_course()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

        all_lessons = self.course_repo.get_all_ordered_lessons_for_course(course.id)
        total_lessons = len(all_lessons)

        progress = self.course_repo.get_user_progress(user.id, course.id)
        completed_count = progress.completed_lessons_count if progress else 0
        current_lesson_id = progress.current_lesson_id if progress else (all_lessons[0].id if all_lessons else None)

        percentage = round((completed_count / total_lessons * 100), 1) if total_lessons > 0 else 0.0

        return UserProgressSummaryResponse(
            user_id=user.id,
            course_id=course.id,
            course_title=course.title,
            current_lesson_id=current_lesson_id,
            completed_lessons_count=completed_count,
            total_lessons_count=total_lessons,
            completion_percentage=min(100.0, percentage)
        )

    def practice_session(self, user_id: Optional[int] = None) -> PracticeResponse:
        user = self.user_repo.get_user_by_id(user_id) if user_id else self.user_repo.get_default_user()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        stats = self.user_repo.get_or_create_user_stats(user.id)
        hearts_to_add = 1 if stats.current_hearts < stats.max_hearts else 0
        stats.current_hearts = min(stats.max_hearts, stats.current_hearts + 1)

        # Award practice XP
        practice_xp = 10
        stats.total_xp += practice_xp

        # Update daily activity
        activity = self.user_repo.get_or_create_today_activity(user.id)
        activity.xp_earned += practice_xp

        # Update leaderboard
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        lb_entry = self.user_repo.get_or_create_leaderboard_entry(user.id, "Bronze", week_start)
        lb_entry.weekly_xp += practice_xp

        self.db.commit()

        return PracticeResponse(
            hearts_recovered=hearts_to_add,
            current_hearts=stats.current_hearts,
            xp_earned=practice_xp,
            total_xp=stats.total_xp,
            message=f"Practice complete! Earned {practice_xp} XP and recovered {hearts_to_add} heart."
        )

    def refill_hearts(self, user_id: Optional[int] = None, method: str = "gems") -> RefillHeartsResponse:
        user = self.user_repo.get_user_by_id(user_id) if user_id else self.user_repo.get_default_user()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        stats = self.user_repo.get_or_create_user_stats(user.id)
        if stats.current_hearts >= stats.max_hearts:
            return RefillHeartsResponse(
                current_hearts=stats.current_hearts,
                gems=stats.gems,
                message="Your hearts are already full!"
            )

        if method == "gems":
            cost = 100
            if stats.gems < cost:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough gems! Refill requires {cost} gems, you have {stats.gems}."
                )
            stats.gems -= cost
            stats.current_hearts = stats.max_hearts
            stats.last_heart_refill_at = datetime.now(timezone.utc)
            message = f"Refilled hearts to maximum! Deducted {cost} gems."
        else:
            stats.current_hearts = stats.max_hearts
            stats.last_heart_refill_at = datetime.now(timezone.utc)
            message = "Practice completed! Hearts fully restored."

        self.db.commit()
        return RefillHeartsResponse(
            current_hearts=stats.current_hearts,
            gems=stats.gems,
            message=message
        )

    def get_daily_activity(self, user_id: int, days: int = 7) -> List[DailyActivityResponse]:
        self.user_repo.get_or_create_today_activity(user_id)
        activities = self.user_repo.get_recent_daily_activities(user_id, days)
        return [DailyActivityResponse.model_validate(a) for a in activities]

    def get_leaderboard(self, league: str = "Bronze", current_user_id: Optional[int] = None) -> LeaderboardResponse:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())

        results = self.user_repo.get_leaderboard_for_week(league, week_start, limit=50)

        if current_user_id is None:
            default_user = self.user_repo.get_default_user()
            if default_user:
                current_user_id = default_user.id

        entries: List[LeaderboardUserItem] = []
        for rank, (entry, user) in enumerate(results, start=1):
            entries.append(
                LeaderboardUserItem(
                    user_id=user.id,
                    username=user.username,
                    avatar_url=user.avatar_url,
                    weekly_xp=entry.weekly_xp,
                    rank=rank,
                    is_current_user=(user.id == current_user_id) if current_user_id else False
                )
            )

        return LeaderboardResponse(
            league=league,
            week_start_date=week_start.isoformat(),
            entries=entries
        )

    def get_user_achievements(self, user_id: Optional[int] = None) -> AchievementsListResponse:
        user = self.user_repo.get_user_by_id(user_id) if user_id else self.user_repo.get_default_user()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        all_achievements = self.user_repo.get_all_achievements()
        items: List[AchievementItemResponse] = []
        unlocked_count = 0

        for ach in all_achievements:
            ua = self.user_repo.get_or_create_user_achievement(user.id, ach.id)
            if ua.is_unlocked:
                unlocked_count += 1
            items.append(
                AchievementItemResponse(
                    id=ach.id,
                    code=ach.code,
                    title=ach.title,
                    description=ach.description,
                    badge_icon=ach.badge_icon,
                    target_value=ach.target_value,
                    current_progress=ua.current_progress,
                    is_unlocked=ua.is_unlocked,
                    xp_reward=ach.xp_reward
                )
            )

        return AchievementsListResponse(
            achievements=items,
            unlocked_count=unlocked_count,
            total_count=len(all_achievements)
        )
