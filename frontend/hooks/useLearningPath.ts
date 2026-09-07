'use client';

import { useState, useEffect, useCallback } from 'react';
import { UnitDetailResponse, SkillSummaryResponse, Course } from '@/types/course';
import { api } from '@/lib/api';

export function useLearningPath(courseId: number = 1, userId: number = 1) {
  const [units, setUnits] = useState<UnitDetailResponse[]>([]);
  const [skills, setSkills] = useState<SkillSummaryResponse[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPath = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch skills directly from GET /api/skills as required
      const [skillsData, unitsData, courseData] = await Promise.all([
        api.getSkills(undefined, courseId, userId),
        api.getUnits(courseId, userId),
        api.getCourse(courseId).catch(() => null),
      ]);

      setSkills(skillsData);
      setCourse(courseData);

      // Map units ensuring each unit's skills come directly from the GET /api/skills response
      const mergedUnits: UnitDetailResponse[] = unitsData
        .sort((a, b) => a.order_index - b.order_index)
        .map((unit) => {
          const unitSkills = skillsData
            .filter((s) => s.unit_id === unit.id)
            .sort((a, b) => a.order_index - b.order_index);

          return {
            ...unit,
            skills: unitSkills.length > 0 ? unitSkills : unit.skills,
          };
        });

      setUnits(mergedUnits);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load curriculum from backend';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [courseId, userId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchPath();
  }, [fetchPath]);

  return {
    units,
    skills,
    course,
    loading,
    error,
    refreshPath: fetchPath,
  };
}
