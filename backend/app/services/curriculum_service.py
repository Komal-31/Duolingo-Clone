from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.course_repository import CourseRepository
from app.repositories.lesson_repository import LessonRepository
from app.schemas.course import (
    CourseResponse,
    LearningPathResponse,
    UnitPathItem,
    UnitDetailResponse,
    SkillPathItem,
    SkillSummaryResponse,
    SkillDetailResponse,
    LessonPathItem,
)
from app.schemas.lesson import LessonDetailResponse, ExerciseResponse


class CurriculumService:
    def __init__(self, db: Session):
        self.db = db
        self.course_repo = CourseRepository(db)
        self.lesson_repo = LessonRepository(db)

    def get_all_courses(self) -> List[CourseResponse]:
        courses = self.course_repo.get_all_courses()
        results = []
        for c in courses:
            total_units = len(c.units) if hasattr(c, "units") and c.units else 0
            lessons = self.course_repo.get_all_ordered_lessons_for_course(c.id)
            results.append(
                CourseResponse(
                    id=c.id,
                    title=c.title,
                    description=c.description,
                    source_language=c.source_language,
                    target_language=c.target_language,
                    flag_emoji=c.flag_emoji,
                    order_index=c.order_index,
                    total_units=total_units,
                    total_lessons=len(lessons)
                )
            )
        return results

    def get_course(self, course_id: Optional[int] = None) -> CourseResponse:
        if course_id is not None:
            course = self.course_repo.get_course_by_id(course_id)
        else:
            course = self.course_repo.get_default_course()

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )

        all_lessons = self.course_repo.get_all_ordered_lessons_for_course(course.id)
        units = self.course_repo.get_units_for_course(course.id)
        total_skills = sum(len(u.skills) for u in units)

        return CourseResponse(
            id=course.id,
            title=course.title,
            description=course.description,
            source_language=course.source_language,
            target_language=course.target_language,
            flag_emoji=course.flag_emoji,
            order_index=course.order_index,
            total_units=len(units),
            total_skills=total_skills,
            total_lessons=len(all_lessons)
        )

    def _get_lesson_index_map(self, course_id: int, user_id: int):
        all_ordered_lessons = self.course_repo.get_all_ordered_lessons_for_course(course_id)
        ordered_ids = [l.id for l in all_ordered_lessons]
        progress = self.course_repo.get_user_progress(user_id, course_id)

        current_index = 0
        if progress and progress.current_lesson_id in ordered_ids:
            current_index = ordered_ids.index(progress.current_lesson_id)
        elif progress and progress.completed_lessons_count >= len(ordered_ids) and len(ordered_ids) > 0:
            current_index = len(ordered_ids)

        return ordered_ids, current_index

    def get_units(self, course_id: Optional[int] = None, user_id: int = 1) -> List[UnitDetailResponse]:
        if course_id is None:
            course = self.course_repo.get_default_course()
            if not course:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No courses available")
            course_id = course.id

        ordered_ids, current_index = self._get_lesson_index_map(course_id, user_id)
        units = self.course_repo.get_units_for_course(course_id)

        unit_details: List[UnitDetailResponse] = []
        for unit in units:
            skill_summaries: List[SkillSummaryResponse] = []
            for skill in unit.skills:
                completed_count = 0
                total_in_skill = len(skill.lessons)
                has_active = False
                all_locked = True

                for lesson in skill.lessons:
                    if lesson.id in ordered_ids:
                        l_idx = ordered_ids.index(lesson.id)
                        if l_idx < current_index:
                            completed_count += 1
                            all_locked = False
                        elif l_idx == current_index:
                            has_active = True
                            all_locked = False

                if total_in_skill > 0 and completed_count == total_in_skill:
                    skill_status = "completed"
                elif has_active:
                    skill_status = "active"
                elif all_locked:
                    skill_status = "locked"
                else:
                    skill_status = "active"

                skill_summaries.append(
                    SkillSummaryResponse(
                        id=skill.id,
                        unit_id=skill.unit_id,
                        title=skill.title,
                        description=skill.description,
                        icon=skill.icon,
                        order_index=skill.order_index,
                        total_lessons=total_in_skill,
                        completed_lessons=completed_count,
                        status=skill_status
                    )
                )

            unit_details.append(
                UnitDetailResponse(
                    id=unit.id,
                    course_id=unit.course_id,
                    title=unit.title,
                    description=unit.description,
                    order_index=unit.order_index,
                    skills=skill_summaries
                )
            )

        return unit_details

    def get_skills(
        self, unit_id: Optional[int] = None, course_id: Optional[int] = None, user_id: int = 1
    ) -> List[SkillSummaryResponse]:
        if course_id is None:
            course = self.course_repo.get_default_course()
            if course:
                course_id = course.id

        ordered_ids, current_index = self._get_lesson_index_map(course_id or 1, user_id)
        skills = self.course_repo.get_skills(unit_id=unit_id, course_id=course_id)

        result: List[SkillSummaryResponse] = []
        for skill in skills:
            completed_count = 0
            total_in_skill = len(skill.lessons)
            has_active = False
            all_locked = True

            for lesson in skill.lessons:
                if lesson.id in ordered_ids:
                    l_idx = ordered_ids.index(lesson.id)
                    if l_idx < current_index:
                        completed_count += 1
                        all_locked = False
                    elif l_idx == current_index:
                        has_active = True
                        all_locked = False

            if total_in_skill > 0 and completed_count == total_in_skill:
                skill_status = "completed"
            elif has_active:
                skill_status = "active"
            elif all_locked:
                skill_status = "locked"
            else:
                skill_status = "active"

            result.append(
                SkillSummaryResponse(
                    id=skill.id,
                    unit_id=skill.unit_id,
                    title=skill.title,
                    description=skill.description,
                    icon=skill.icon,
                    order_index=skill.order_index,
                    total_lessons=total_in_skill,
                    completed_lessons=completed_count,
                    status=skill_status
                )
            )
        return result

    def get_skill_by_id(self, skill_id: int, user_id: int = 1) -> SkillDetailResponse:
        skill = self.course_repo.get_skill_by_id(skill_id)
        if not skill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Skill {skill_id} not found")

        course_id = skill.unit.course_id if skill.unit else 1
        ordered_ids, current_index = self._get_lesson_index_map(course_id, user_id)

        lessons_result: List[LessonPathItem] = []
        completed_in_skill = 0
        has_active = False
        all_locked = True

        for lesson in skill.lessons:
            if lesson.id in ordered_ids:
                l_idx = ordered_ids.index(lesson.id)
                if l_idx < current_index:
                    l_status = "completed"
                    completed_in_skill += 1
                    all_locked = False
                elif l_idx == current_index:
                    l_status = "active"
                    has_active = True
                    all_locked = False
                else:
                    l_status = "locked"
            else:
                l_status = "locked"

            lessons_result.append(
                LessonPathItem(
                    id=lesson.id,
                    title=lesson.title,
                    order_index=lesson.order_index,
                    xp_reward=lesson.xp_reward,
                    status=l_status
                )
            )

        total_in_skill = len(skill.lessons)
        if total_in_skill > 0 and completed_in_skill == total_in_skill:
            skill_status = "completed"
        elif has_active:
            skill_status = "active"
        elif all_locked:
            skill_status = "locked"
        else:
            skill_status = "active"

        return SkillDetailResponse(
            id=skill.id,
            unit_id=skill.unit_id,
            title=skill.title,
            description=skill.description,
            icon=skill.icon,
            order_index=skill.order_index,
            status=skill_status,
            lessons=lessons_result
        )

    def get_lesson_by_id(self, lesson_id: int) -> LessonDetailResponse:
        lesson = self.lesson_repo.get_lesson_by_id(lesson_id)
        if not lesson:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Lesson {lesson_id} not found")

        exercises = [
            ExerciseResponse(
                id=ex.id,
                lesson_id=ex.lesson_id,
                type=ex.type,
                prompt=ex.prompt,
                content=ex.content,
                order_index=ex.order_index
            )
            for ex in lesson.exercises
        ]

        return LessonDetailResponse(
            id=lesson.id,
            skill_id=lesson.skill_id,
            title=lesson.title,
            order_index=lesson.order_index,
            xp_reward=lesson.xp_reward,
            exercises=exercises
        )

    def get_learning_path(self, course_id: int, user_id: int) -> LearningPathResponse:
        course = self.course_repo.get_course_full_hierarchy(course_id)
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Course with ID {course_id} not found")

        ordered_lesson_ids, current_index = self._get_lesson_index_map(course_id, user_id)
        progress = self.course_repo.get_user_progress(user_id, course_id)
        current_lesson_id = progress.current_lesson_id if progress else (ordered_lesson_ids[0] if ordered_lesson_ids else None)

        units_result: List[UnitPathItem] = []

        for unit in course.units:
            skills_result: List[SkillPathItem] = []

            for skill in unit.skills:
                lessons_result: List[LessonPathItem] = []
                completed_in_skill = 0

                for lesson in skill.lessons:
                    if lesson.id in ordered_lesson_ids:
                        lesson_idx = ordered_lesson_ids.index(lesson.id)
                        if lesson_idx < current_index:
                            l_status = "completed"
                            completed_in_skill += 1
                        elif lesson_idx == current_index:
                            l_status = "active"
                        else:
                            l_status = "locked"
                    else:
                        l_status = "locked"

                    lessons_result.append(
                        LessonPathItem(
                            id=lesson.id,
                            title=lesson.title,
                            order_index=lesson.order_index,
                            xp_reward=lesson.xp_reward,
                            status=l_status
                        )
                    )

                total_in_skill = len(skill.lessons)
                if completed_in_skill == total_in_skill and total_in_skill > 0:
                    skill_status = "completed"
                elif any(l.status == "active" for l in lessons_result):
                    skill_status = "active"
                elif all(l.status == "locked" for l in lessons_result):
                    skill_status = "locked"
                else:
                    skill_status = "active"

                skills_result.append(
                    SkillPathItem(
                        id=skill.id,
                        title=skill.title,
                        description=skill.description,
                        icon=skill.icon,
                        order_index=skill.order_index,
                        total_lessons=total_in_skill,
                        completed_lessons=completed_in_skill,
                        status=skill_status,
                        lessons=lessons_result
                    )
                )

            units_result.append(
                UnitPathItem(
                    id=unit.id,
                    title=unit.title,
                    description=unit.description,
                    order_index=unit.order_index,
                    skills=skills_result
                )
            )

        return LearningPathResponse(
            course_id=course.id,
            course_title=course.title,
            target_language=course.target_language,
            flag_emoji=course.flag_emoji,
            current_lesson_id=current_lesson_id,
            units=units_result
        )
