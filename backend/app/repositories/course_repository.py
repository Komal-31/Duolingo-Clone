from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.course import Course, Unit, Skill
from app.models.lesson import Lesson
from app.models.progress import UserProgress


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_courses(self) -> List[Course]:
        return self.db.query(Course).order_by(Course.order_index).all()

    def get_default_course(self) -> Optional[Course]:
        return self.db.query(Course).order_by(Course.order_index).first()

    def get_course_by_id(self, course_id: int) -> Optional[Course]:
        return self.db.query(Course).filter(Course.id == course_id).first()

    def get_course_full_hierarchy(self, course_id: int) -> Optional[Course]:
        return (
            self.db.query(Course)
            .options(
                joinedload(Course.units)
                .joinedload(Unit.skills)
                .joinedload(Skill.lessons)
            )
            .filter(Course.id == course_id)
            .first()
        )

    def get_units_for_course(self, course_id: Optional[int] = None) -> List[Unit]:
        query = self.db.query(Unit).options(
            joinedload(Unit.skills).joinedload(Skill.lessons)
        )
        if course_id is not None:
            query = query.filter(Unit.course_id == course_id)
        return query.order_by(Unit.order_index).all()

    def get_unit_by_id(self, unit_id: int) -> Optional[Unit]:
        return (
            self.db.query(Unit)
            .options(joinedload(Unit.skills).joinedload(Skill.lessons))
            .filter(Unit.id == unit_id)
            .first()
        )

    def get_skills(self, unit_id: Optional[int] = None, course_id: Optional[int] = None) -> List[Skill]:
        query = self.db.query(Skill).options(joinedload(Skill.lessons))
        if unit_id is not None:
            query = query.filter(Skill.unit_id == unit_id)
        elif course_id is not None:
            query = query.join(Unit, Skill.unit_id == Unit.id).filter(Unit.course_id == course_id)
        return query.order_by(Skill.order_index).all()

    def get_skill_by_id(self, skill_id: int) -> Optional[Skill]:
        return (
            self.db.query(Skill)
            .options(joinedload(Skill.lessons), joinedload(Skill.unit))
            .filter(Skill.id == skill_id)
            .first()
        )

    def get_user_progress(self, user_id: int, course_id: int) -> Optional[UserProgress]:
        return (
            self.db.query(UserProgress)
            .filter(UserProgress.user_id == user_id, UserProgress.course_id == course_id)
            .first()
        )

    def create_or_update_progress(
        self, user_id: int, course_id: int, current_lesson_id: int, completed_lessons_count: int
    ) -> UserProgress:
        progress = self.get_user_progress(user_id, course_id)
        if not progress:
            progress = UserProgress(
                user_id=user_id,
                course_id=course_id,
                current_lesson_id=current_lesson_id,
                completed_lessons_count=completed_lessons_count
            )
            self.db.add(progress)
        else:
            progress.current_lesson_id = current_lesson_id
            progress.completed_lessons_count = completed_lessons_count
        self.db.flush()
        return progress

    def get_all_ordered_lessons_for_course(self, course_id: int) -> List[Lesson]:
        return (
            self.db.query(Lesson)
            .join(Skill, Lesson.skill_id == Skill.id)
            .join(Unit, Skill.unit_id == Unit.id)
            .filter(Unit.course_id == course_id)
            .order_by(Unit.order_index, Skill.order_index, Lesson.order_index)
            .all()
        )
