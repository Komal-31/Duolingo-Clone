from datetime import date, datetime, timedelta, timezone
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from app.models.user import User
from app.models.stats import UserStats, DailyActivity
from app.models.gamification import LeaderboardEntry, Achievement, UserAchievement


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_default_user(self) -> Optional[User]:
        user = self.db.query(User).filter(User.username == "Shivam").first()
        if not user:
            user = self.db.query(User).filter(User.id == 1).first()
        if not user:
            user = self.db.query(User).first()
        return user

    def get_user_stats(self, user_id: int) -> Optional[UserStats]:
        return self.db.query(UserStats).filter(UserStats.user_id == user_id).first()

    def get_or_create_user_stats(self, user_id: int) -> UserStats:
        stats = self.get_user_stats(user_id)
        if not stats:
            stats = UserStats(
                user_id=user_id,
                total_xp=0,
                current_hearts=5,
                max_hearts=5,
                streak_count=0,
                highest_streak=0,
                gems=500,
                last_heart_refill_at=datetime.now(timezone.utc)
            )
            self.db.add(stats)
            self.db.flush()
        return stats

    def get_or_create_today_activity(self, user_id: int) -> DailyActivity:
        today = date.today()
        activity = (
            self.db.query(DailyActivity)
            .filter(DailyActivity.user_id == user_id, DailyActivity.activity_date == today)
            .first()
        )
        if not activity:
            activity = DailyActivity(
                user_id=user_id,
                activity_date=today,
                xp_earned=0,
                lessons_completed=0,
                daily_goal_xp=50,
                goal_reached=False
            )
            self.db.add(activity)
            self.db.flush()
        return activity

    def get_recent_daily_activities(self, user_id: int, days: int = 7) -> List[DailyActivity]:
        start_date = date.today() - timedelta(days=days - 1)
        return (
            self.db.query(DailyActivity)
            .filter(DailyActivity.user_id == user_id, DailyActivity.activity_date >= start_date)
            .order_by(DailyActivity.activity_date.asc())
            .all()
        )

    def get_leaderboard_for_week(
        self, league: str, week_start: date, limit: int = 50
    ) -> List[Tuple[LeaderboardEntry, User]]:
        return (
            self.db.query(LeaderboardEntry, User)
            .join(User, LeaderboardEntry.user_id == User.id)
            .filter(
                LeaderboardEntry.league == league,
                LeaderboardEntry.week_start_date == week_start
            )
            .order_by(LeaderboardEntry.weekly_xp.desc())
            .limit(limit)
            .all()
        )

    def get_or_create_leaderboard_entry(self, user_id: int, league: str, week_start: date) -> LeaderboardEntry:
        entry = (
            self.db.query(LeaderboardEntry)
            .filter(
                LeaderboardEntry.user_id == user_id,
                LeaderboardEntry.week_start_date == week_start
            )
            .first()
        )
        if not entry:
            entry = LeaderboardEntry(
                user_id=user_id,
                league=league,
                week_start_date=week_start,
                weekly_xp=0
            )
            self.db.add(entry)
            self.db.flush()
        return entry

    def get_all_achievements(self) -> List[Achievement]:
        return self.db.query(Achievement).order_by(Achievement.id).all()

    def get_user_achievements(self, user_id: int) -> List[UserAchievement]:
        return (
            self.db.query(UserAchievement)
            .options(joinedload(UserAchievement.achievement))
            .filter(UserAchievement.user_id == user_id)
            .all()
        )

    def get_or_create_user_achievement(self, user_id: int, achievement_id: int) -> UserAchievement:
        ua = (
            self.db.query(UserAchievement)
            .filter(
                UserAchievement.user_id == user_id,
                UserAchievement.achievement_id == achievement_id
            )
            .first()
        )
        if not ua:
            ua = UserAchievement(
                user_id=user_id,
                achievement_id=achievement_id,
                current_progress=0,
                is_unlocked=False
            )
            self.db.add(ua)
            self.db.flush()
        return ua
