from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.gamification_service import GamificationService
from app.schemas.gamification import LeaderboardResponse

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=LeaderboardResponse)
def get_leaderboard(
    league: str = Query(default="Bronze", description="League tier e.g. Bronze, Silver, Gold"),
    user_id: Optional[int] = Query(default=1, description="ID of current user to flag in rankings"),
    db: Session = Depends(get_db)
):
    """Retrieve weekly leaderboard rankings for the specified league."""
    service = GamificationService(db)
    return service.get_leaderboard(league=league, current_user_id=user_id)
