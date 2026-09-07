from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class LeaderboardUserItem(BaseModel):
    user_id: int
    username: str
    avatar_url: Optional[str] = None
    weekly_xp: int
    rank: int
    is_current_user: bool


class LeaderboardResponse(BaseModel):
    league: str
    week_start_date: str
    entries: List[LeaderboardUserItem]


class AchievementItemResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    badge_icon: str
    target_value: int
    current_progress: int
    is_unlocked: bool
    xp_reward: int

    model_config = ConfigDict(from_attributes=True)


class AchievementsListResponse(BaseModel):
    achievements: List[AchievementItemResponse]
    unlocked_count: int
    total_count: int
