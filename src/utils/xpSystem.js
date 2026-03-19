export const XP_REWARDS = {
  habit_health: 15,
  habit_mind: 12,
  habit_learning: 12,
  habit_finance: 10,
  habit_spiritual: 10,
  habit_productivity: 10,
  habit_default: 10,
  goal_milestone: 25,
  goal_complete: 100,
  mood_log: 5,
  journal_entry: 8,
  health_water: 3,
  health_steps: 5,
  health_workout: 15,
  health_sleep: 5,
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450
];

export const LEVEL_TITLES = [
  'Novice', 'Apprentice', 'Explorer', 'Seeker', 'Achiever',
  'Warrior', 'Champion', 'Hero', 'Legend', 'Sage',
  'Master', 'Grandmaster', 'Immortal', 'Celestial', 'Transcendent',
  'Paragon', 'Divine', 'Mythic', 'Eternal', 'Ascendant'
];

export function getLevelFromXP(xp) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

export function getLevelTitle(level) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

export function getLevelProgress(xp) {
  const level = getLevelFromXP(xp);
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpInLevel = xp - currentLevelXP;
  const xpForLevel = nextLevelXP - currentLevelXP;
  const progress = Math.min((xpInLevel / xpForLevel) * 100, 100);
  return { level, progress, xpInLevel, xpForLevel, title: getLevelTitle(level) };
}
