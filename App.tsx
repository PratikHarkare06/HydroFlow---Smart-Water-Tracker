import React, { useState, useEffect, useRef } from 'react';
import { Home, Clock, BarChart2, Settings as SettingsIcon, Plus, Trophy } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import Dashboard from './components/Dashboard';
import Reminders from './components/Reminders';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import AddDrinkModal from './components/AddDrinkModal';
import AchievementsScreen from './components/AchievementsScreen';
import Auth from './components/Auth';
import NotificationToast from './components/NotificationToast';
import GoalCalculatorModal from './components/GoalCalculatorModal';
import Onboarding from './components/Onboarding';
import { DailyStats, DrinkType, ScreenName, WaterRecord, UserSettings, User, Achievement, CoachingPlan, ChallengeMission, LeaderboardEntry, HealthPatternInsight, HealthRiskAlert } from './types';
import { sendNotification, playNotificationSound } from './services/notificationService';
import { playClickSound, playWaterSound, playSuccessSound } from './services/soundService';
import { saveWaterRecord, deleteWaterRecord, fetchDailyRecords, upsertUserSettings, fetchUserSettings, saveWaterRecordsBatch } from './services/dbService';
import { buildWeeklyCoachingPlan, calculateAdaptiveGoal, recommendReminderInterval, calculateDrinkQualityScore, detectHydrationPatterns, assessHydrationRisk, buildPersonalizedTips } from './services/hydrationPlanner';

type AppState = 'loading' | 'auth' | 'onboarding' | 'app';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toast, setToast] = useState<{title: string, message: string} | null>(null);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_sip', title: 'First Sip', description: 'Log your first drink', icon: '🥤', unlocked: false },
    { id: 'goal_reached', title: 'Goal Smasher', description: 'Reach your daily goal', icon: '🎯', unlocked: false },
    { id: 'streak_3', title: 'On Fire', description: '3-day streak', icon: '🔥', unlocked: false },
    { id: 'streak_7', title: 'Hydration Hero', description: '7-day streak', icon: '🔥', unlocked: false },
    { id: 'early_bird', title: 'Early Bird', description: 'Drink before 8 AM', icon: '🌅', unlocked: false },
  ]);

  const [settings, setSettings] = useState<UserSettings>({
    dailyGoal: 2200,
    reminderIntervalMinutes: 120,
    notificationsEnabled: false,
    wakeUpTime: "09:00",
    bedTime: "23:00",
    reminderType: 'interval',
    specificTimes: ["09:00", "12:00", "15:00", "18:00", "21:00"],
    adaptiveGoalEnabled: true,
    smartRemindersEnabled: true,
    activityLevel: 'medium',
    climate: 'temperate',
    goalFocus: 'wellness',
    socialModeEnabled: true,
    unitSystem: 'ml',
    language: 'en',
    wearableSyncEnabled: false
  });

  const [stats, setStats] = useState<DailyStats>({
    date: selectedDate,
    target: settings.dailyGoal,
    caloriesBurned: 0, 
    heartRate: 0, 
    workoutTimeMinutes: 0,
    records: []
  });

  const [allHistory, setAllHistory] = useState<DailyStats[]>([]);
  const [effectiveGoal, setEffectiveGoal] = useState<number>(2200);
  const [coachingPlan, setCoachingPlan] = useState<CoachingPlan | null>(null);
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [missions, setMissions] = useState<ChallengeMission[]>([
    { id: 'm_daily_goal', title: 'Goal Hunter', description: 'Reach your daily goal 3 times this week', target: 3, progress: 0, completed: false, rewardXp: 120 },
    { id: 'm_morning', title: 'Morning Sprint', description: 'Log water before 9:00 AM for 5 days', target: 5, progress: 0, completed: false, rewardXp: 150 },
    { id: 'm_consistent', title: 'Hydration Cadence', description: 'Log at least 4 drinks in a day for 4 days', target: 4, progress: 0, completed: false, rewardXp: 130 }
  ]);
  const [milestonesCelebrated, setMilestonesCelebrated] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [healthPatterns, setHealthPatterns] = useState<HealthPatternInsight[]>([]);
  const [riskAlert, setRiskAlert] = useState<HealthRiskAlert>({ level: 'none', title: 'On track', message: 'Your hydration pace looks balanced.' });
  const [personalizedTips, setPersonalizedTips] = useState<string[]>([]);
  const [drinkQualityScore, setDrinkQualityScore] = useState<number>(0);

  const statsRef = useRef(stats);
  const settingsRef = useRef(settings);
  const lastProcessedMinute = useRef<string>("");
  const xpRef = useRef(xp);
  const levelRef = useRef(level);

  const loadHistory = async () => {
    const history: DailyStats[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      if (userId) {
        try {
          const records = await fetchDailyRecords(userId, dateStr);
          history.push({
            date: dateStr,
            target: settingsRef.current.dailyGoal,
            caloriesBurned: 0,
            heartRate: 0,
            workoutTimeMinutes: 0,
            records: records
          });
        } catch (e) {
          console.error("Cloud fetch failed for history", e);
        }
      } else {
        const saved = localStorage.getItem(`hydroflow_stats_${dateStr}`);
        if (saved) {
          history.push(JSON.parse(saved));
        } else if (dateStr === selectedDate) {
          history.push(statsRef.current);
        }
      }
    }
    setAllHistory(history);
    const adaptiveGoal = calculateAdaptiveGoal(settingsRef.current, history);
    setEffectiveGoal(adaptiveGoal);
    setCoachingPlan(buildWeeklyCoachingPlan(history, settingsRef.current));
    updateMissionsFromHistory(history);
    setHealthPatterns(detectHydrationPatterns(history));
  };

  const migrateGuestDataToCloud = async (cloudUserId: string) => {
    const migratedFlag = localStorage.getItem(`hydroflow_guest_migrated_${cloudUserId}`);
    if (migratedFlag === 'true') return;

    const statKeys = Object.keys(localStorage).filter((key) => key.startsWith('hydroflow_stats_'));
    const recordsToMigrate: WaterRecord[] = [];

    for (const key of statKeys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed: DailyStats = JSON.parse(raw);
        if (!Array.isArray(parsed.records)) continue;
        recordsToMigrate.push(...parsed.records);
      } catch (e) {
        console.error('Failed parsing local stat key during migration', key, e);
      }
    }

    try {
      if (recordsToMigrate.length > 0) {
        await saveWaterRecordsBatch(cloudUserId, recordsToMigrate);
      }
      await upsertUserSettings(cloudUserId, settingsRef.current);
      localStorage.setItem(`hydroflow_guest_migrated_${cloudUserId}`, 'true');
      localStorage.removeItem('hydroflow_guest_mode');
      setToast({
        title: 'Cloud Sync Complete',
        message: recordsToMigrate.length > 0 ? `Migrated ${recordsToMigrate.length} local records to your account.` : 'Your local settings are now linked to your account.'
      });
    } catch (e) {
      console.error('Guest migration failed', e);
      setToast({
        title: 'Sync Pending',
        message: 'Your guest history could not be migrated right now. We kept local data safe.'
      });
    }
  };

  useEffect(() => {
    const darkModePref = localStorage.getItem('hydroflow_darkmode');
    if (darkModePref === 'true') setIsDarkMode(true);
    
    const savedAchievements = localStorage.getItem('hydroflow_achievements');
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));

    const savedSettings = localStorage.getItem('hydroflow_settings');
    if (savedSettings && !userId) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed,
          specificTimes: Array.isArray(parsed.specificTimes) ? parsed.specificTimes : prev.specificTimes
        }));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    const savedUser = localStorage.getItem('hydroflow_user');
    if (savedUser) {
        setUser(JSON.parse(savedUser));
    }

    const savedXp = localStorage.getItem('hydroflow_xp');
    if (savedXp) setXp(Number(savedXp) || 0);

    const savedLevel = localStorage.getItem('hydroflow_level');
    if (savedLevel) setLevel(Math.max(1, Number(savedLevel) || 1));

    const savedMissions = localStorage.getItem('hydroflow_missions');
    if (savedMissions) {
      try {
        setMissions(JSON.parse(savedMissions));
      } catch (e) {
        console.error('Failed to parse missions', e);
      }
    }

    const savedMilestones = localStorage.getItem('hydroflow_milestones');
    if (savedMilestones) {
      try {
        setMilestonesCelebrated(JSON.parse(savedMilestones));
      } catch (e) {
        console.error('Failed to parse milestones', e);
      }
    }
  }, []);

  useEffect(() => {
    statsRef.current = stats;
    if (stats.date) {
        localStorage.setItem(`hydroflow_stats_${stats.date}`, JSON.stringify(stats));
        checkAchievementsAndStreak();
        loadHistory();
    }
  }, [stats]);

  useEffect(() => {
    settingsRef.current = settings;
    localStorage.setItem('hydroflow_settings', JSON.stringify(settings));
    if (userId) {
      upsertUserSettings(userId, settings).catch(e => console.error("Failed to sync settings", e));
    }
  }, [settings, userId]);

  useEffect(() => {
    if (user) {
        localStorage.setItem('hydroflow_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hydroflow_xp', String(xp));
    localStorage.setItem('hydroflow_level', String(level));
    xpRef.current = xp;
    levelRef.current = level;
  }, [xp, level]);

  useEffect(() => {
    localStorage.setItem('hydroflow_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('hydroflow_milestones', JSON.stringify(milestonesCelebrated));
  }, [milestonesCelebrated]);

  useEffect(() => {
    const meName = user?.name || 'You';
    const others: LeaderboardEntry[] = [
      { id: 'lb_1', name: 'Aarav', points: Math.max(200, xp + 120) },
      { id: 'lb_2', name: 'Mira', points: Math.max(180, xp + 60) },
      { id: 'lb_3', name: meName, points: xp, isYou: true },
      { id: 'lb_4', name: 'Riya', points: Math.max(120, xp - 40) }
    ];
    setLeaderboard(others.sort((a, b) => b.points - a.points));
  }, [xp, user]);

  useEffect(() => {
    const initApp = async () => {
      const isGuest = localStorage.getItem('hydroflow_guest_mode') === 'true';
      const completedOnboarding = localStorage.getItem('hydroflow_onboarding_completed') === 'true';
      if (isGuest) {
        setAppState(completedOnboarding ? 'app' : 'onboarding');
        setIsSupabaseConnected(false);
        if (!user) {
          setUser({
            name: 'Guest',
            email: 'Guest Mode',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`
          });
        }
        return;
      }

      try {
        const result = await supabase.auth.getSession();
        const session = result.data?.session;
        
        if (session?.user) {
          setUserId(session.user.id);
          const userData = {
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
          };
          setUser(userData);
          setIsSupabaseConnected(true);
          
          const cloudSettings = await fetchUserSettings(session.user.id);
          if (cloudSettings) setSettings(cloudSettings);
          await migrateGuestDataToCloud(session.user.id);

          setAppState(completedOnboarding ? 'app' : 'onboarding');
        } else {
          setAppState('auth');
        }
      } catch (err) {
        console.error("Init check failed", err);
        setIsSupabaseConnected(false);
        setAppState('auth');
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;
      setUserId(session.user.id);
      setIsSupabaseConnected(true);
      setUser({
        name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        avatar: session.user.user_metadata.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`
      });
      await migrateGuestDataToCloud(session.user.id);
      const completedOnboarding = localStorage.getItem('hydroflow_onboarding_completed') === 'true';
      setAppState(completedOnboarding ? 'app' : 'onboarding');
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadDayData = async () => {
      if (userId) {
        try {
          const cloudRecords = await fetchDailyRecords(userId, selectedDate);
          setStats({
            date: selectedDate,
            target: effectiveGoal,
            caloriesBurned: 0,
            heartRate: 0,
            workoutTimeMinutes: 0,
            records: cloudRecords
          });
        } catch (e) {
          console.error("Cloud records fetch failed", e);
        }
      } else {
        const savedStats = localStorage.getItem(`hydroflow_stats_${selectedDate}`);
        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          setStats({ ...parsed, target: parsed.target || settings.dailyGoal });
        } else {
          setStats({
            date: selectedDate,
            target: effectiveGoal,
            caloriesBurned: 0,
            heartRate: 0,
            workoutTimeMinutes: 0,
            records: []
          });
        }
      }
    };
    loadDayData();
  }, [selectedDate, settings.dailyGoal, userId, effectiveGoal]);

  useEffect(() => {
    setStats((prev) => ({ ...prev, target: effectiveGoal }));
  }, [effectiveGoal]);

  useEffect(() => {
    const currentIntake = stats.records.reduce((sum, r) => sum + r.amount, 0);
    const qualityScore = calculateDrinkQualityScore(stats.records);
    setDrinkQualityScore(qualityScore);
    setRiskAlert(assessHydrationRisk(currentIntake, stats.target, stats.records));
    setPersonalizedTips(buildPersonalizedTips(currentIntake, stats.target, qualityScore, healthPatterns));
  }, [stats, healthPatterns]);

  const handleGuestMode = () => {
    playClickSound();
    localStorage.setItem('hydroflow_guest_mode', 'true');
    setUser({
      name: 'Guest',
      email: 'Guest Mode',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`
    });
    const completedOnboarding = localStorage.getItem('hydroflow_onboarding_completed') === 'true';
    setAppState(completedOnboarding ? 'app' : 'onboarding');
  };

  const handleAuthSuccess = async () => {
    const completedOnboarding = localStorage.getItem('hydroflow_onboarding_completed') === 'true';
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        await migrateGuestDataToCloud(data.session.user.id);
      }
    } catch (e) {
      console.error('Failed to refresh session after login', e);
    }
    setAppState(completedOnboarding ? 'app' : 'onboarding');
  };

  const handleToggleDarkMode = () => {
    playClickSound();
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('hydroflow_darkmode', String(newMode));
  };

  const awardXp = (amount: number, reason: string) => {
    if (amount <= 0) return;
    let nextXp = xpRef.current + amount;
    let nextLevel = levelRef.current;
    let threshold = nextLevel * 250;
    while (nextXp >= threshold) {
      nextXp -= threshold;
      nextLevel += 1;
      threshold = nextLevel * 250;
      setToast({ title: 'Level Up!', message: `You reached level ${nextLevel}. Keep the streak alive!` });
      playSuccessSound();
    }
    setXp(nextXp);
    setLevel(nextLevel);
    xpRef.current = nextXp;
    levelRef.current = nextLevel;
    if (reason && amount >= 50) {
      setToast({ title: 'XP Earned', message: `+${amount} XP for ${reason}` });
    }
  };

  const updateMissionsFromHistory = (history: DailyStats[]) => {
    const recent = history.slice(0, 7);
    const goalDays = recent.filter((day) => day.records.reduce((sum, r) => sum + r.amount, 0) >= day.target).length;
    const morningDays = recent.filter((day) =>
      day.records.some((record) => new Date(record.timestamp).getHours() < 9)
    ).length;
    const consistentDays = recent.filter((day) => day.records.length >= 4).length;

    setMissions((prev) =>
      prev.map((mission) => {
        let progress = mission.progress;
        if (mission.id === 'm_daily_goal') progress = Math.min(mission.target, goalDays);
        if (mission.id === 'm_morning') progress = Math.min(mission.target, morningDays);
        if (mission.id === 'm_consistent') progress = Math.min(mission.target, consistentDays);

        const completed = progress >= mission.target;
        if (!mission.completed && completed) {
          awardXp(mission.rewardXp, `${mission.title} completed`);
          setToast({ title: 'Challenge Completed!', message: `${mission.title} finished. +${mission.rewardXp} XP` });
        }
        return { ...mission, progress, completed };
      })
    );
  };

  const checkAchievementsAndStreak = () => {
    let currentStreakCount = 0;
    const now = new Date();
    const weekStamp = `${now.getFullYear()}-W${Math.ceil((now.getDate() + new Date(now.getFullYear(), 0, 1).getDay()) / 7)}`;
    let recoveryUsed = localStorage.getItem('hydroflow_streak_recovery_week') === weekStamp;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
        const dateStr = d.toISOString().split('T')[0];
        const saved = localStorage.getItem(`hydroflow_stats_${dateStr}`);
        if (!saved) { 
          if (i === 0) {
            d.setDate(d.getDate() - 1);
            continue;
          }
          if (!recoveryUsed && i < 10 && currentStreakCount >= 2) {
            recoveryUsed = true;
            localStorage.setItem('hydroflow_streak_recovery_week', weekStamp);
            setToast({ title: 'Streak Saved', message: 'Grace save used for this week. Keep your streak going!' });
            d.setDate(d.getDate() - 1);
            continue;
          }
          break; 
        }
        const dayStats = JSON.parse(saved);
        const intake = dayStats.records.reduce((sum: number, r: WaterRecord) => sum + r.amount, 0);
        if (intake >= (dayStats.target || 2000)) currentStreakCount++;
        else if (i > 0) break;
        d.setDate(d.getDate() - 1);
    }
    setStreak(currentStreakCount);
    if ([7, 30, 90].includes(currentStreakCount)) {
      const key = `streak_${currentStreakCount}`;
      if (!milestonesCelebrated.includes(key)) {
        setMilestonesCelebrated((prev) => [...prev, key]);
        setToast({ title: 'Milestone Hit!', message: `${currentStreakCount}-day streak celebration unlocked!` });
        awardXp(100 + currentStreakCount, `${currentStreakCount}-day milestone`);
      }
    }

    // Achievement Logic
    const currentStats = statsRef.current;
    const currentIntake = currentStats.records.reduce((sum, r) => sum + r.amount, 0);
    const hasEarlyBird = currentStats.records.some(r => {
      const hour = new Date(r.timestamp).getHours();
      return hour < 8;
    });

    let updatedAchievements = false;
    const newAchievements = achievements.map(ach => {
      let isUnlocked = ach.unlocked;
      if (!isUnlocked) {
        if (ach.id === 'first_sip' && currentStats.records.length > 0) isUnlocked = true;
        if (ach.id === 'goal_reached' && currentIntake >= currentStats.target) isUnlocked = true;
        if (ach.id === 'streak_3' && currentStreakCount >= 3) isUnlocked = true;
        if (ach.id === 'streak_7' && currentStreakCount >= 7) isUnlocked = true;
        if (ach.id === 'early_bird' && hasEarlyBird) isUnlocked = true;

        if (isUnlocked) {
          updatedAchievements = true;
          setToast({ title: "Badge Unlocked!", message: `You earned the ${ach.title} achievement! ${ach.icon}` });
          playSuccessSound();
          awardXp(70, `${ach.title} badge`);
        }
      }
      return { ...ach, unlocked: isUnlocked };
    });

    if (updatedAchievements) {
      setAchievements(newAchievements);
      localStorage.setItem('hydroflow_achievements', JSON.stringify(newAchievements));
    }
  };

  const triggerNotification = (title: string, message: string) => {
    const sent = sendNotification(title, message);
    if (!sent) {
       setToast({ title, message });
       playNotificationSound();
    }
  };

  const checkReminders = () => {
    const currentSettings = settingsRef.current;
    if (!currentSettings.notificationsEnabled) return;

    const now = new Date();
    const currentHm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (lastProcessedMinute.current === currentHm) return;

    if (currentSettings.reminderType === 'specific') {
       const schedules = Array.isArray(currentSettings.specificTimes) ? currentSettings.specificTimes : [];
       if (schedules.includes(currentHm)) {
          lastProcessedMinute.current = currentHm;
          triggerNotification("Hydration Time!", "It's time for your scheduled water break. 💧");
       }
    } else {
       const currentStats = statsRef.current;
       if (currentStats.records.length > 0) {
           const sorted = [...currentStats.records].sort((a, b) => 
             new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
           );
           const lastDrink = new Date(sorted[0].timestamp);
           const diffMinutes = (now.getTime() - lastDrink.getTime()) / (1000 * 60);
           
           const intelligentInterval = recommendReminderInterval(currentSettings, allHistory);
           if (diffMinutes >= intelligentInterval) {
                lastProcessedMinute.current = currentHm;
                const reminderMsg = currentSettings.smartRemindersEnabled
                  ? `Smart reminder: your recent pattern suggests a water break every ${intelligentInterval} minutes. 💧`
                  : "It's been a while since your last drink. 💧";
                triggerNotification("Time to hydrate!", reminderMsg);
           }
       } else {
           const [wakeH, wakeM] = currentSettings.wakeUpTime.split(':').map(Number);
           const wakeDate = new Date();
           wakeDate.setHours(wakeH, wakeM, 0, 0);
           
           if (now > wakeDate) {
              lastProcessedMinute.current = currentHm;
              triggerNotification("Morning Hydration", "Start your day with a fresh glass of water! 🌊");
           }
       }
    }
  };

  const checkRemindersRef = useRef(checkReminders);
  useEffect(() => {
    checkRemindersRef.current = checkReminders;
  }, [checkReminders]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkRemindersRef.current();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddWater = async (amount: number, type: DrinkType, note: string) => {
    playWaterSound();
    const newRecord: WaterRecord = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      type,
      note,
      timestamp: new Date().toISOString()
    };
    
    setStats(prev => ({
      ...prev,
      records: [newRecord, ...prev.records]
    }));
    
    setIsAddModalOpen(false);
    awardXp(Math.max(5, Math.round(amount / 100) * 2), 'hydration logging');

    if (userId) {
      try {
        await saveWaterRecord(userId, newRecord);
      } catch (e) {
        console.error("Cloud save failed", e);
        setToast({ title: "Local Sync Only", message: "Couldn't save to cloud. Record stored locally." });
      }
    }
    
    const total = stats.records.reduce((sum, r) => sum + r.amount, 0) + amount;
    if (total >= stats.target) {
        playSuccessSound();
        triggerNotification("Goal Reached!", "Congratulations! You've reached your hydration goal for today. 🥳");
        awardXp(90, 'daily goal completion');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    setStats(prev => ({
      ...prev,
      records: prev.records.filter(r => r.id !== id)
    }));

    if (userId) {
      try {
        await deleteWaterRecord(id);
      } catch (e) {
        console.error("Cloud delete failed", e);
      }
    }
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      const adaptiveGoal = calculateAdaptiveGoal(updated, allHistory);
      setEffectiveGoal(adaptiveGoal);
      return updated;
    });
  };

  const handleLogout = () => {
    playClickSound();
    localStorage.removeItem('hydroflow_guest_mode');
    localStorage.removeItem('hydroflow_user');
    setUserId(null);
    setUser(null);
    supabase.auth.signOut(); 
    setAppState('auth'); 
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'reminders':
        return <Reminders stats={stats} onBack={() => setCurrentScreen('home')} isDarkMode={isDarkMode} onDeleteRecord={handleDeleteRecord} settings={settings} />;
      case 'statistics':
        return (
          <Statistics
            history={allHistory}
            achievements={achievements}
            currentStreak={streak}
            isDarkMode={isDarkMode}
            coachingPlan={coachingPlan}
            missions={missions}
            xp={xp}
            level={level}
            leaderboard={leaderboard}
            socialModeEnabled={settings.socialModeEnabled !== false}
            drinkQualityScore={drinkQualityScore}
            riskAlert={riskAlert}
            healthPatterns={healthPatterns}
            personalizedTips={personalizedTips}
            onViewAchievements={() => setCurrentScreen('achievements')}
          />
        );
      case 'settings':
        return (
          <Settings 
            user={user} 
            settings={settings} 
            onUpdateSettings={handleUpdateSettings} 
            onUpdateUser={(name, avatar) => setUser(u => u ? {...u, name, avatar} : { name, avatar, email: 'Guest' })}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onAddSpecificTime={(t) => setSettings(s => ({...s, specificTimes: [...(s.specificTimes || []), t]}))}
            onRemoveSpecificTime={(t) => setSettings(s => ({...s, specificTimes: (s.specificTimes || []).filter(x => x !== t)}))}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
          />
        );
      case 'achievements':
        return <AchievementsScreen achievements={achievements} onBack={() => setCurrentScreen('statistics')} isDarkMode={isDarkMode} />;
      default:
        return (
          <Dashboard 
            stats={stats} 
            user={user} 
            onAddWaterClick={() => setIsAddModalOpen(true)} 
            onQuickAdd={handleAddWater}
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate}
            weeklyStats={allHistory} 
            isDarkMode={isDarkMode} 
            streak={streak} 
            onDeleteRecord={handleDeleteRecord}
            adaptiveGoal={effectiveGoal}
            drinkQualityScore={drinkQualityScore}
            riskAlert={riskAlert}
            personalizedTips={personalizedTips}
            healthPatterns={healthPatterns}
            guidanceContext={`${settings.activityLevel || 'medium'} activity, ${settings.climate || 'temperate'} climate`}
            unitSystem={settings.unitSystem || 'ml'}
          />
        );
    }
  };

  if (appState === 'loading') return <div className="h-full w-full bg-black flex flex-col items-center justify-center font-bold text-purple-600"><Plus size={48} className="animate-spin mb-4" /> Loading HydroFlow...</div>;
  if (appState === 'auth') return <Auth onLogin={handleAuthSuccess} onGuest={handleGuestMode} />;
  if (appState === 'onboarding') {
    return (
      <Onboarding
        onComplete={(profile) => {
          setSettings((prev) => ({ ...prev, ...profile }));
          localStorage.setItem('hydroflow_onboarding_completed', 'true');
          setAppState('app');
        }}
      />
    );
  }

  return (
    <div className={`h-[100dvh] w-full flex flex-col relative overflow-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-purple-50 text-gray-900'}`}>
      <div className="flex-1 w-full flex flex-col overflow-hidden relative">
          <main className="flex-1 overflow-hidden relative">
            <div className="h-full w-full flex flex-col">
               {renderScreen()}
            </div>
          </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 pointer-events-none pb-[env(safe-area-inset-bottom)] mb-4 sm:mb-6 px-4">
          <nav className={`w-full max-w-4xl pointer-events-auto h-20 border rounded-[2.5rem] flex items-center justify-around px-6 shadow-2xl ${isDarkMode ? 'bg-black border-white/10 shadow-purple-500/10' : 'bg-white border-purple-50'}`}>
            <button onClick={() => { playClickSound(); setCurrentScreen('home'); }} className={`p-2 transition-all active:scale-90 ${currentScreen === 'home' ? 'text-purple-600' : 'text-gray-400'}`}><Home size={24} /></button>
            <button onClick={() => { playClickSound(); setCurrentScreen('reminders'); }} className={`p-2 transition-all active:scale-90 ${currentScreen === 'reminders' ? 'text-purple-600' : 'text-gray-400'}`}><Clock size={24} /></button>
            <div className="relative -top-10">
               <button onClick={() => { playClickSound(); setIsAddModalOpen(true); }} className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-purple-500/40 active:scale-95 transition-all"><Plus size={36} /></button>
            </div>
            <button onClick={() => { playClickSound(); setCurrentScreen('statistics'); }} className={`p-2 transition-all active:scale-90 ${currentScreen === 'statistics' ? 'text-purple-600' : 'text-gray-400'}`}><BarChart2 size={24} /></button>
            <button onClick={() => { playClickSound(); setCurrentScreen('settings'); }} className={`p-2 transition-all active:scale-90 ${currentScreen === 'settings' ? 'text-purple-600' : 'text-gray-400'}`}><SettingsIcon size={24} /></button>
          </nav>
      </div>

      {isAddModalOpen && <AddDrinkModal isOpen={isAddModalOpen} isDarkMode={isDarkMode} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddWater} unitSystem={settings.unitSystem || 'ml'} />}
      {isCalculatorOpen && (
        <GoalCalculatorModal 
          isOpen={isCalculatorOpen} 
          isDarkMode={isDarkMode} 
          onClose={() => setIsCalculatorOpen(false)} 
          onSetGoal={(newGoal) => {
            handleUpdateSettings({ dailyGoal: newGoal });
            setIsCalculatorOpen(false);
            playSuccessSound();
          }} 
        />
      )}
      {toast && <NotificationToast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;