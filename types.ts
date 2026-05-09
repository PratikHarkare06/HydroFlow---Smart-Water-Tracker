
export enum DrinkType {
  WATER = 'Water',
  COFFEE = 'Coffee',
  TEA = 'Tea',
  JUICE = 'Juice',
  SODA = 'Soda'
}

export interface WaterRecord {
  id: string;
  amount: number; // in ml
  type: DrinkType;
  timestamp: string; // ISO string
  note?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  target: number;
  caloriesBurned: number;
  heartRate: number;
  workoutTimeMinutes: number;
  records: WaterRecord[];
}

export interface UserSettings {
  dailyGoal: number;
  reminderIntervalMinutes: number;
  notificationsEnabled: boolean;
  wakeUpTime: string;
  bedTime: string;
  reminderType: 'interval' | 'specific';
  specificTimes: string[]; // Array of "HH:MM" strings
  adaptiveGoalEnabled?: boolean;
  smartRemindersEnabled?: boolean;
  weightKg?: number;
  activityLevel?: 'low' | 'medium' | 'high';
  climate?: 'cool' | 'temperate' | 'hot';
  goalFocus?: 'consistency' | 'performance' | 'wellness';
  socialModeEnabled?: boolean;
  unitSystem?: 'ml' | 'oz';
  language?: 'en' | 'hi';
  wearableSyncEnabled?: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type ScreenName = 'home' | 'reminders' | 'statistics' | 'settings' | 'achievements';

export interface CoachingPlan {
  title: string;
  goals: string[];
  focus: string;
}

export interface ChallengeMission {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  rewardXp: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  isYou?: boolean;
}

export interface HealthPatternInsight {
  id: string;
  label: string;
  severity: 'info' | 'warning';
  detail: string;
}

export interface HealthRiskAlert {
  level: 'none' | 'low' | 'medium' | 'high';
  title: string;
  message: string;
}
