from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.curriculum_service import CurriculumService
from app.schemas.course import (
    CourseResponse,
    LearningPathResponse,
    UnitDetailResponse,
    SkillSummaryResponse,
    SkillDetailResponse,
)

router = APIRouter(prefix="/api", tags=["Course & Curriculum"])


@router.get("/course", response_model=CourseResponse)
def get_course(
    course_id: Optional[int] = Query(default=None, description="Course ID (optional, defaults to primary course)"),
    db: Session = Depends(get_db)
):
    """Retrieve details for the primary language course or specific course."""
    service = CurriculumService(db)
    return service.get_course(course_id)


@router.get("/courses", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    """Retrieve all available language courses."""
    service = CurriculumService(db)
    return service.get_all_courses()


@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course_by_id(course_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a specific course by ID."""
    service = CurriculumService(db)
    return service.get_course(course_id)


@router.get("/courses/{course_id}/path", response_model=LearningPathResponse)
def get_learning_path(
    course_id: int,
    user_id: int = Query(default=1, description="ID of the learning user"),
    db: Session = Depends(get_db)
):
    """Retrieve the full learning path with skill tree, lesson units, and user progress states."""
    service = CurriculumService(db)
    return service.get_learning_path(course_id, user_id)


@router.get("/units", response_model=List[UnitDetailResponse])
def get_units(
    course_id: Optional[int] = Query(default=None, description="Filter units by course ID"),
    user_id: int = Query(default=1, description="User ID for unlocking and status calculation"),
    db: Session = Depends(get_db)
):
    """Retrieve curriculum units with nested skills and their unlocked/active/completed statuses."""
    service = CurriculumService(db)
    return service.get_units(course_id=course_id, user_id=user_id)


@router.get("/skills", response_model=List[SkillSummaryResponse])
def get_skills(
    unit_id: Optional[int] = Query(default=None, description="Filter skills by unit ID"),
    course_id: Optional[int] = Query(default=None, description="Filter skills by course ID"),
    user_id: int = Query(default=1, description="User ID for unlocking and status calculation"),
    db: Session = Depends(get_db)
):
    """Retrieve list of skills with current user completion status."""
    service = CurriculumService(db)
    return service.get_skills(unit_id=unit_id, course_id=course_id, user_id=user_id)


@router.get("/skills/{id}", response_model=SkillDetailResponse)
def get_skill(
    id: int,
    user_id: int = Query(default=1, description="User ID for unlocking and status calculation"),
    db: Session = Depends(get_db)
):
    """Retrieve details for a single skill and its contained lessons with user statuses."""
    service = CurriculumService(db)
    return service.get_skill_by_id(skill_id=id, user_id=user_id)
