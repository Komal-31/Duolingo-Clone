export type ExerciseType =
  | 'multiple_choice'
  | 'translate_to_target'
  | 'translate_to_source'
  | 'match_pairs'
  | 'fill_in_blank'
  | 'type_answer';

export interface MultipleChoiceOption {
  id: string;
  text: string;
  image?: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface ExerciseContent {
  options?: MultipleChoiceOption[];
  source_sentence?: string;
  target_sentence?: string;
  word_bank?: string[];
  pairs?: MatchPair[];
  sentence_parts?: string[];
  blank_options?: string[];
  hint?: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  type: ExerciseType;
  prompt: string;
  content: ExerciseContent;
  order_index: number;
}

export interface StartLessonResponse {
  attempt_id: number;
  lesson_id: number;
  lesson_title: string;
  hearts_remaining: number;
  xp_reward: number;
  exercises: Exercise[];
}

export interface SubmitAnswerRequest {
  exercise_id?: number;
  user_answer: string | string[] | Record<string, string>;
  attempt_id?: number;
}

export interface SubmitAnswerResponse {
  is_correct: boolean;
  correct_answer: string | string[] | Record<string, string>;
  explanation: string | null;
  hearts_remaining: number;
  is_failed: boolean;
  mistakes_count: number;
}

export interface CompleteLessonResponse {
  status: string;
  xp_earned: number;
  total_xp: number;
  current_hearts: number;
  streak_count: number;
  daily_goal_xp: number;
  today_xp: number;
  daily_goal_reached: boolean;
  unlocked_achievements: string[];
  next_lesson_id: number | null;
}
