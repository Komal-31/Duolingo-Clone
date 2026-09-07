from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.gamification_service import GamificationService
from app.schemas.user import UserResponse, UserProgressSummaryResponse
from app.schemas.stats import UserStatsResponse, RefillHeartsResponse, PracticeResponse, DailyActivityResponse
from app.schemas.gamification import AchievementsListResponse

router = APIRouter(prefix="/api/users", tags=["Users & Stats"])


# --- /api/users/me Endpoints ---

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    user_id: Optional[int] = Query(default=None, description="Optional user ID override (defaults to current user)"),
    db: Session = Depends(get_db)
):
    """Get active user profile (default learner)."""
    service = GamificationService(db)
    return service.get_user(user_id)


@router.get("/me/progress", response_model=UserProgressSummaryResponse)
def get_my_progress(
    course_id: Optional[int] = Query(default=None, description="Optional course ID"),
    user_id: Optional[int] = Query(default=None, description="Optional user ID override"),
    db: Session = Depends(get_db)
):
    """Get active user's curriculum progress and percentage complete."""
    service = GamificationService(db)
    return service.get_user_progress(user_id=user_id, course_id=course_id)


@router.get("/me/stats", response_model=UserStatsResponse)
def get_my_stats(
    user_id: Optional[int] = Query(default=None, description="Optional user ID override"),
    db: Session = Depends(get_db)
):
    """Get active user's XP, hearts, streak, and gems."""
    service = GamificationService(db)
    return service.get_user_stats(user_id)


@router.post("/me/practice", response_model=PracticeResponse)
def do_practice_session(
    user_id: Optional[int] = Query(default=None, description="Optional user ID override"),
    db: Session = Depends(get_db)
):
    """Complete a practice session to recover hearts and earn bonus XP."""
    service = GamificationService(db)
    return service.practice_session(user_id)


@router.post("/me/refill-hearts", response_model=RefillHeartsResponse)
def refill_my_hearts(
    method: str = Query(default="gems", description="'gems' (costs 100 gems) or 'practice'"),
    user_id: Optional[int] = Query(default=None, description="Optional user ID override"),
    db: Session = Depends(get_db)
):
    """Refill active user's hearts to maximum (5) using gems or practice."""
    service = GamificationService(db)
    return service.refill_hearts(user_id=user_id, method=method)


# --- Additional / Legacy Endpoints ---

@router.get("/current", response_model=UserResponse)
def get_current_user_legacy(
    user_id: Optional[int] = Query(default=None, description="ID of current user"),
    db: Session = Depends(get_db)
):
    """Get active user profile (legacy path)."""
    service = GamificationService(db)
    return service.get_user(user_id)


@router.get("/{user_id}/stats", response_model=UserStatsResponse)
def get_user_stats_by_id(user_id: int, db: Session = Depends(get_db)):
    """Get stats for a specific user ID."""
    service = GamificationService(db)
    return service.get_user_stats(user_id)


@router.post("/{user_id}/refill-hearts", response_model=RefillHeartsResponse)
def refill_hearts_by_id(
    user_id: int,
    method: str = Query(default="gems", description="'gems' or 'practice'"),
    db: Session = Depends(get_db)
):
    """Refill user hearts to maximum using gems or practice session."""
    service = GamificationService(db)
    return service.refill_hearts(user_id, method=method)


@router.get("/{user_id}/activity", response_model=List[DailyActivityResponse])
def get_user_activity(
    user_id: int,
    days: int = Query(default=7, description="Number of past days to retrieve"),
    db: Session = Depends(get_db)
):
    """Get recent daily learning activity and progress toward daily XP goal."""
    service = GamificationService(db)
    return service.get_daily_activity(user_id, days=days)


@router.get("/{user_id}/achievements", response_model=AchievementsListResponse)
def get_user_achievements_by_id(user_id: int, db: Session = Depends(get_db)):
    """Get all achievements with user's progress and unlock state."""
    service = GamificationService(db)
    return service.get_user_achievements(user_id)
