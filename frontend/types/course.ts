export interface LessonPathItem {
  id: number;
  title: string;
  order_index: number;
  xp_reward: number;
  status: 'completed' | 'active' | 'locked';
}

export interface SkillPathItem {
  id: number;
  title: string;
  description: string | null;
  icon: string;
  order_index: number;
  total_lessons: number;
  completed_lessons: number;
  status: 'completed' | 'active' | 'locked';
  lessons: LessonPathItem[];
}

export interface UnitPathItem {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  skills: SkillPathItem[];
}

export interface LearningPathResponse {
  course_id: number;
  course_title: string;
  target_language: string;
  flag_emoji: string;
  current_lesson_id: number | null;
  units: UnitPathItem[];
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  source_language: string;
  target_language: string;
  flag_emoji: string;
  order_index: number;
  total_units?: number;
  total_skills?: number;
  total_lessons?: number;
}

export interface SkillSummaryResponse {
  id: number;
  unit_id: number;
  title: string;
  description: string | null;
  icon: string;
  order_index: number;
  total_lessons: number;
  completed_lessons: number;
  status: 'completed' | 'active' | 'locked';
}

export interface SkillDetailResponse {
  id: number;
  unit_id: number;
  title: string;
  description: string | null;
  icon: string;
  order_index: number;
  status: 'completed' | 'active' | 'locked';
  lessons: LessonPathItem[];
}

export interface UnitDetailResponse {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  order_index: number;
  skills: SkillSummaryResponse[];
}
