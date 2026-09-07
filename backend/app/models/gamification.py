from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    league = Column(String(20), nullable=False, default="Bronze")  # Bronze, Silver, Gold, Sapphire, Ruby, Diamond
    week_start_date = Column(Date, nullable=False)
    weekly_xp = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint("user_id", "week_start_date", name="uq_user_weekly_leaderboard"),
    )

    # Relationships
    user = relationship("User", back_populates="leaderboard_entries")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    badge_icon = Column(String(50), nullable=False)  # Icon name: flame, zap, target, crown, book, trophy
    target_value = Column(Integer, nullable=False, default=1)
    xp_reward = Column(Integer, nullable=False, default=20)

    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement", cascade="all, delete-orphan")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True)
    current_progress = Column(Integer, nullable=False, default=0)
    is_unlocked = Column(Boolean, nullable=False, default=False)
    unlocked_at = Column(DateTime, nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )

    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
