from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    total_xp = Column(Integer, nullable=False, default=0)
    current_hearts = Column(Integer, nullable=False, default=5)
    max_hearts = Column(Integer, nullable=False, default=5)
    last_heart_refill_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    streak_count = Column(Integer, nullable=False, default=0)
    highest_streak = Column(Integer, nullable=False, default=0)
    last_streak_date = Column(Date, nullable=True)
    gems = Column(Integer, nullable=False, default=500)

    # Relationships
    user = relationship("User", back_populates="stats")


class DailyActivity(Base):
    __tablename__ = "daily_activities"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_date = Column(Date, default=date.today, nullable=False)
    xp_earned = Column(Integer, nullable=False, default=0)
    lessons_completed = Column(Integer, nullable=False, default=0)
    daily_goal_xp = Column(Integer, nullable=False, default=50)
    goal_reached = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint("user_id", "activity_date", name="uq_user_daily_activity"),
    )

    # Relationships
    user = relationship("User", back_populates="daily_activities")
