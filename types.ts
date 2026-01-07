
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
