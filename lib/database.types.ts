export type SubscriptionTier = 'free' | 'scholar' | 'champion' | 'ultimate';
export type EventType = 'test' | 'assignment' | 'lecture' | 'other';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type RaceStatus = 'upcoming' | 'active' | 'completed';
export type RaceType = 'xp' | 'typing';
export type ContactStatus = 'new' | 'responded' | 'archived';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: SubscriptionTier;
  subscription_id: string | null;
  total_xp: number;
  calendar_uploads_used: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  user_id: string;
  name: string;
  color: string;
  days_of_week: number[];
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  class_id: string | null;
  title: string;
  description: string | null;
  event_type: EventType;
  due_date: string;
  color: string;
  weight?: number | null;
  created_at: string;
}

export interface Course {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  duration_days: number;
  thumbnail_url: string | null;
  difficulty: Difficulty;
  total_xp_reward: number;
  is_published: boolean;
  created_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  content: Record<string, unknown>;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  xp_earned: number;
  completed_at: string | null;
  started_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  xp_requirement: number | null;
  unlock_condition: Record<string, unknown>;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface RacePeriod {
  id: string;
  start_date: string;
  end_date: string;
  status: RaceStatus;
  race_type: RaceType;
  title: string | null;
  description: string | null;
  participant_count: number;
  prize_pool_1st: number;
  prize_pool_2nd: number;
  prize_pool_3rd: number;
  created_at: string;
}

export interface RaceEntry {
  id: string;
  race_period_id: string;
  user_id: string;
  opted_in_at: string;
  xp_earned_during_race: number;
  typing_speed_wpm: number | null;
  typing_accuracy: number | null;
  is_final_submission: boolean;
  final_rank: number | null;
  payout_amount: number | null;
  paid_out: boolean;
}

export interface RaceAnnouncement {
  id: string;
  race_period_id: string | null;
  title: string;
  message: string;
  sent_to_count: number;
  created_at: string;
}
