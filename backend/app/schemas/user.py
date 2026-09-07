from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    username: str
    email: str
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserProgressSummaryResponse(BaseModel):
    user_id: int
    course_id: int
    course_title: str
    current_lesson_id: Optional[int] = None
    completed_lessons_count: int
    total_lessons_count: int
    completion_percentage: float
