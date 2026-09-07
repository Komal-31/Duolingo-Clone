from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class LessonPathItem(BaseModel):
    id: int
    title: str
    order_index: int
    xp_reward: int
    status: str  # "completed", "active", "locked"

    model_config = ConfigDict(from_attributes=True)


class SkillSummaryResponse(BaseModel):
    id: int
    unit_id: int
    title: str
    description: Optional[str] = None
    icon: str
    order_index: int
    total_lessons: int = 0
    completed_lessons: int = 0
    status: str = "active"  # "completed", "active", "locked"

    model_config = ConfigDict(from_attributes=True)


class SkillPathItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    icon: str
    order_index: int
    total_lessons: int
    completed_lessons: int
    status: str  # "completed", "active", "locked"
    lessons: List[LessonPathItem]

    model_config = ConfigDict(from_attributes=True)


class SkillDetailResponse(BaseModel):
    id: int
    unit_id: int
    title: str
    description: Optional[str] = None
    icon: str
    order_index: int
    status: str
    lessons: List[LessonPathItem]

    model_config = ConfigDict(from_attributes=True)


class UnitPathItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    order_index: int
    skills: List[SkillPathItem]

    model_config = ConfigDict(from_attributes=True)


class UnitDetailResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str] = None
    order_index: int
    skills: List[SkillSummaryResponse]

    model_config = ConfigDict(from_attributes=True)


class LearningPathResponse(BaseModel):
    course_id: int
    course_title: str
    target_language: str
    flag_emoji: str
    current_lesson_id: Optional[int] = None
    units: List[UnitPathItem]


class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    source_language: str
    target_language: str
    flag_emoji: str
    order_index: int
    total_units: Optional[int] = None
    total_skills: Optional[int] = None
    total_lessons: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
