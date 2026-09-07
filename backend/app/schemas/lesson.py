from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict


class ExerciseResponse(BaseModel):
    id: int
    lesson_id: int
    type: str  # multiple_choice, translate_to_target, translate_to_source, match_pairs, fill_in_blank, type_answer
    prompt: str
    content: Any  # JSON object containing options, word tokens, pairs, hints
    order_index: int

    model_config = ConfigDict(from_attributes=True)


class LessonDetailResponse(BaseModel):
    id: int
    skill_id: int
    title: str
    order_index: int
    xp_reward: int
    exercises: List[ExerciseResponse]

    model_config = ConfigDict(from_attributes=True)


class StartLessonResponse(BaseModel):
    attempt_id: int
    lesson_id: int
    lesson_title: str
    hearts_remaining: int
    xp_reward: int
    exercises: List[ExerciseResponse]


class SubmitAnswerRequest(BaseModel):
    exercise_id: Optional[int] = None
    user_answer: Any  # string, array of strings, or dictionary of pairs
    attempt_id: Optional[int] = None


class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: Any
    explanation: Optional[str] = None
    hearts_remaining: int
    is_failed: bool
    mistakes_count: int


class CompleteLessonRequest(BaseModel):
    attempt_id: Optional[int] = None


class CompleteLessonResponse(BaseModel):
    status: str  # "completed"
    xp_earned: int
    total_xp: int
    current_hearts: int
    streak_count: int
    daily_goal_xp: int
    today_xp: int
    daily_goal_reached: bool
    unlocked_achievements: List[str]
    next_lesson_id: Optional[int] = None
