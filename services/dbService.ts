import { supabase } from './supabaseClient';
import { DailyStats, WaterRecord, UserSettings } from '../types';

export const saveWaterRecord = async (userId: string, record: WaterRecord) => {
  const { data, error } = await supabase
    .from('hydration_records')
    .insert([
      {
        id: record.id,
        user_id: userId,
        amount: record.amount,
        type: record.type,
        timestamp: record.timestamp,
        note: record.note,
        date: record.timestamp.split('T')[0]
      }
    ]);
  
  if (error) throw error;
  return data;
};

export const deleteWaterRecord = async (recordId: string) => {
  const { error } = await supabase
    .from('hydration_records')
    .delete()
    .eq('id', recordId);
  
  if (error) throw error;
};

export const fetchDailyRecords = async (userId: string, date: string): Promise<WaterRecord[]> => {
  const { data, error } = await supabase
    .from('hydration_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data.map(d => ({
    id: d.id,
    amount: d.amount,
    type: d.type,
    timestamp: d.timestamp,
    note: d.note
  }));
};

export const upsertUserSettings = async (userId: string, settings: UserSettings) => {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      daily_goal: settings.dailyGoal,
      reminder_interval: settings.reminderIntervalMinutes,
      notifications_enabled: settings.notificationsEnabled,
      wake_up_time: settings.wakeUpTime,
      bed_time: settings.bedTime,
      reminder_type: settings.reminderType,
      specific_times: settings.specificTimes
    });
  
  if (error) throw error;
};

export const fetchUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
  if (!data) return null;

  return {
    dailyGoal: data.daily_goal,
    reminderIntervalMinutes: data.reminder_interval,
    notificationsEnabled: data.notifications_enabled,
    wakeUpTime: data.wake_up_time,
    bedTime: data.bed_time,
    reminderType: data.reminder_type,
    specificTimes: data.specific_times
  };
};