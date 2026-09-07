from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserStatsResponse(BaseModel):
    user_id: int
    total_xp: int
    current_hearts: int
    max_hearts: int
    streak_count: int
    highest_streak: int
    last_streak_date: Optional[date] = None
    gems: int

    model_config = ConfigDict(from_attributes=True)


class RefillHeartsResponse(BaseModel):
    current_hearts: int
    gems: int
    message: str


class PracticeResponse(BaseModel):
    hearts_recovered: int
    current_hearts: int
    xp_earned: int
    total_xp: int
    message: str


class DailyActivityResponse(BaseModel):
    activity_date: date
    xp_earned: int
    lessons_completed: int
    daily_goal_xp: int
    goal_reached: bool

    model_config = ConfigDict(from_attributes=True)
