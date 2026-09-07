export interface UserStats {
  user_id: number;
  total_xp: number;
  current_hearts: number;
  max_hearts: number;
  streak_count: number;
  highest_streak: number;
  last_streak_date: string | null;
  gems: number;
}

export interface RefillHeartsResponse {
  current_hearts: number;
  gems: number;
  message: string;
}

export interface DailyActivity {
  activity_date: string;
  xp_earned: number;
  lessons_completed: number;
  daily_goal_xp: number;
  goal_reached: boolean;
}

export interface LeaderboardUserItem {
  user_id: number;
  username: string;
  avatar_url: string | null;
  weekly_xp: number;
  rank: number;
  is_current_user: boolean;
}

export interface LeaderboardResponse {
  league: string;
  week_start_date: string;
  entries: LeaderboardUserItem[];
}

export interface AchievementItem {
  id: number;
  code: string;
  title: string;
  description: string;
  badge_icon: string;
  target_value: number;
  current_progress: number;
  is_unlocked: boolean;
  xp_reward: number;
}

export interface AchievementsListResponse {
  achievements: AchievementItem[];
  unlocked_count: number;
  total_count: number;
}
