import { CoachingPlan, DailyStats, DrinkType, HealthPatternInsight, HealthRiskAlert, UserSettings } from '../types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toMinutes = (hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};

export const calculateAdaptiveGoal = (settings: UserSettings, history: DailyStats[]): number => {
  const baseGoal = settings.dailyGoal || 2200;
  if (!settings.adaptiveGoalEnabled) return baseGoal;

  let adaptive = baseGoal;

  if (settings.weightKg && settings.weightKg > 0) {
    const weightGoal = settings.weightKg * 35;
    adaptive = Math.round((adaptive + weightGoal) / 2);
  }

  const activityBoostMap: Record<string, number> = { low: 0, medium: 180, high: 350 };
  adaptive += activityBoostMap[settings.activityLevel || 'low'] || 0;

  const climateBoostMap: Record<string, number> = { cool: 0, temperate: 120, hot: 280 };
  adaptive += climateBoostMap[settings.climate || 'temperate'] || 0;

  const recent = history.slice(0, 7);
  if (recent.length > 0) {
    const avgIntake = recent.reduce((sum, day) => {
      return sum + day.records.reduce((recordSum, r) => recordSum + r.amount, 0);
    }, 0) / recent.length;

    const compliance = avgIntake / Math.max(1, baseGoal);
    if (compliance < 0.7) adaptive -= 150;
    if (compliance > 1.1) adaptive += 120;
  }

  return Math.round(clamp(adaptive, 1500, 4500));
};

export const recommendReminderInterval = (settings: UserSettings, history: DailyStats[]): number => {
  const base = settings.reminderIntervalMinutes || 120;
  if (!settings.smartRemindersEnabled) return base;

  const recent = history.slice(0, 7);
  if (recent.length === 0) return base;

  const activeDays = recent.filter(day => day.records.length > 0);
  if (activeDays.length === 0) return Math.min(base, 90);

  const averageDrinksPerDay = activeDays.reduce((sum, day) => sum + day.records.length, 0) / activeDays.length;
  const wake = toMinutes(settings.wakeUpTime || '09:00');
  const bed = toMinutes(settings.bedTime || '23:00');
  const awakeSpan = Math.max(8 * 60, bed > wake ? bed - wake : 14 * 60);

  const habitBasedInterval = Math.floor(awakeSpan / Math.max(4, averageDrinksPerDay + 1));
  const recommended = Math.round((base + habitBasedInterval) / 2);

  return clamp(recommended, 30, 180);
};

export const buildWeeklyCoachingPlan = (history: DailyStats[], settings: UserSettings): CoachingPlan => {
  const recent = history.slice(0, 7);
  const completedDays = recent.filter(day => {
    const intake = day.records.reduce((sum, r) => sum + r.amount, 0);
    return intake >= day.target;
  }).length;

  const avgIntake = recent.length
    ? Math.round(recent.reduce((sum, day) => sum + day.records.reduce((rSum, r) => rSum + r.amount, 0), 0) / recent.length)
    : 0;

  const completionRate = recent.length ? Math.round((completedDays / recent.length) * 100) : 0;
  const focus = settings.goalFocus || 'wellness';

  const goals = [
    `Complete hydration goal on at least ${Math.min(7, completedDays + 2)} days this week.`,
    `Drink your first glass within 45 minutes of ${settings.wakeUpTime || '09:00'}.`,
    `Target a daily average of ${Math.max(settings.dailyGoal, avgIntake + 150)} ml.`
  ];

  if (completionRate < 50) {
    goals[0] = 'Use quick-log at least 4 times/day to build consistency.';
  }
  if (focus === 'performance') {
    goals[2] = `Add 300 ml around your active hours and target ${Math.max(settings.dailyGoal, avgIntake + 250)} ml/day.`;
  }

  return {
    title: 'Your Weekly Coaching Plan',
    goals,
    focus: `${focus} focus | ${completionRate}% completion last week`
  };
};

export const calculateDrinkQualityScore = (records: DailyStats['records']): number => {
  if (records.length === 0) return 0;

  const weights: Record<string, number> = {
    [DrinkType.WATER]: 1,
    [DrinkType.TEA]: 0.8,
    [DrinkType.JUICE]: 0.55,
    [DrinkType.COFFEE]: 0.45,
    [DrinkType.SODA]: 0.2
  };

  const total = records.reduce((sum, r) => sum + r.amount, 0);
  const qualityVolume = records.reduce((sum, r) => sum + (weights[r.type] ?? 0.4) * r.amount, 0);
  return Math.round((qualityVolume / Math.max(1, total)) * 100);
};

export const detectHydrationPatterns = (history: DailyStats[]): HealthPatternInsight[] => {
  const recent = history.slice(0, 7);
  if (recent.length === 0) return [];

  const insights: HealthPatternInsight[] = [];
  const withIntake = recent.map((day) => ({
    ...day,
    intake: day.records.reduce((sum, r) => sum + r.amount, 0)
  }));

  const weekend = withIntake.filter((d) => {
    const wd = new Date(d.date).getDay();
    return wd === 0 || wd === 6;
  });
  const weekday = withIntake.filter((d) => {
    const wd = new Date(d.date).getDay();
    return wd > 0 && wd < 6;
  });

  const weekendAvg = weekend.length ? weekend.reduce((s, d) => s + d.intake, 0) / weekend.length : 0;
  const weekdayAvg = weekday.length ? weekday.reduce((s, d) => s + d.intake, 0) / weekday.length : 0;
  if (weekend.length > 0 && weekday.length > 0 && weekendAvg < weekdayAvg * 0.8) {
    insights.push({
      id: 'weekend_drop',
      label: 'Weekend drop',
      severity: 'warning',
      detail: 'Your weekend hydration is noticeably lower than weekdays.'
    });
  }

  const lowMornings = withIntake.filter((d) => {
    const morning = d.records
      .filter((r) => new Date(r.timestamp).getHours() < 12)
      .reduce((sum, r) => sum + r.amount, 0);
    return morning < 400;
  }).length;
  if (lowMornings >= 4) {
    insights.push({
      id: 'low_morning',
      label: 'Low morning intake',
      severity: 'warning',
      detail: 'Most days start under-hydrated before noon.'
    });
  }

  const consistencyDays = withIntake.filter((d) => d.intake >= d.target).length;
  if (consistencyDays >= 4) {
    insights.push({
      id: 'strong_consistency',
      label: 'Strong consistency',
      severity: 'info',
      detail: 'You are consistently meeting your hydration target this week.'
    });
  }

  return insights.slice(0, 3);
};

export const assessHydrationRisk = (currentIntake: number, target: number, records: DailyStats['records']): HealthRiskAlert => {
  const completion = target > 0 ? currentIntake / target : 0;
  const lastDrink = records.length
    ? new Date(Math.max(...records.map((r) => new Date(r.timestamp).getTime())))
    : null;
  const minutesSinceLastDrink = lastDrink ? (Date.now() - lastDrink.getTime()) / (1000 * 60) : Number.POSITIVE_INFINITY;

  if (completion < 0.25 && minutesSinceLastDrink > 240) {
    return {
      level: 'high',
      title: 'Hydration risk: high',
      message: 'You are far below today\'s target and have gone a long time without water.'
    };
  }
  if (completion < 0.55 && minutesSinceLastDrink > 150) {
    return {
      level: 'medium',
      title: 'Hydration risk: medium',
      message: 'You are behind your target pace; take a water break in the next 15 minutes.'
    };
  }
  if (completion > 1.5) {
    return {
      level: 'low',
      title: 'Intake check',
      message: 'You are well above target. Continue hydrating gradually instead of large bursts.'
    };
  }
  return { level: 'none', title: 'On track', message: 'Your hydration pace looks balanced.' };
};

export const buildPersonalizedTips = (
  currentIntake: number,
  target: number,
  qualityScore: number,
  insights: HealthPatternInsight[]
): string[] => {
  const tips: string[] = [];
  const remaining = Math.max(0, target - currentIntake);

  if (remaining > 0) {
    tips.push(`You have ${remaining} ml left. Split it into 2-3 smaller sips for easier completion.`);
  } else {
    tips.push('Goal achieved. Maintain with small sips every 60-90 minutes.');
  }
  if (qualityScore < 70) {
    tips.push('Improve hydration quality by replacing one sugary/caffeinated drink with water.');
  }
  if (insights.some((i) => i.id === 'low_morning')) {
    tips.push('Pre-fill a 300 ml glass near your bed to boost morning hydration.');
  }
  if (insights.some((i) => i.id === 'weekend_drop')) {
    tips.push('Set one extra weekend reminder around late morning to avoid a weekend slump.');
  }

  return tips.slice(0, 4);
};
