from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.gamification_service import GamificationService
from app.schemas.gamification import AchievementsListResponse

router = APIRouter(prefix="/api/achievements", tags=["Achievements"])


@router.get("", response_model=AchievementsListResponse)
def get_achievements(
    user_id: Optional[int] = Query(default=None, description="Optional user ID (defaults to current user)"),
    db: Session = Depends(get_db)
):
    """Retrieve all badges and achievements with current user's progress and unlock state."""
    service = GamificationService(db)
    return service.get_user_achievements(user_id)
