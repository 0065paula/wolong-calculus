import type { PlayerProgress, Achievement, GameMode, AchievementLevel } from '../types';

const STORAGE_KEY = 'wolong-math-progress';

export const defaultAchievements: Achievement[] = [
  {
    id: 'first-steps',
    name: '初出茅庐',
    description: '完成第一个关卡',
    icon: '🌱',
    unlocked: false,
  },
  {
    id: 'round-up-master',
    name: '破阵专家',
    description: '完成所有破阵篇关卡',
    icon: '⚔️',
    unlocked: false,
  },
  {
    id: 'multiplication-master',
    name: '奇兵统帅',
    description: '完成所有奇兵篇关卡',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'balance-master',
    name: '粮草总督',
    description: '完成所有粮草篇关卡',
    icon: '⚖️',
    unlocked: false,
  },
  {
    id: 'star-collector',
    name: '摘星者',
    description: '收集50颗星星',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'perfect-warrior',
    name: '完美战士',
    description: '获得3星评价完成任意关卡',
    icon: '💎',
    unlocked: false,
  },
  {
    id: 'speed-demon',
    name: '神速将军',
    description: '30秒内完成一个关卡',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'master-strategist',
    name: '卧龙',
    description: '达到卧龙等级',
    icon: '🐉',
    unlocked: false,
  },
];

export const defaultProgress: PlayerProgress = {
  totalStars: 0,
  completedLevels: {
    'round-up': [],
    'multiplication': [],
    'balance': [],
  },
  achievements: defaultAchievements,
  currentLevel: '书童',
  lastPlayed: new Date().toISOString(),
};

export function saveProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

export function loadProgress(): PlayerProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return {
        ...defaultProgress,
        ...parsed,
        completedLevels: {
          ...defaultProgress.completedLevels,
          ...parsed.completedLevels,
        },
        achievements: parsed.achievements || defaultAchievements,
      };
    }
  } catch (error) {
    console.error('Failed to load progress:', error);
  }
  return defaultProgress;
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear progress:', error);
  }
}

export function calculateAchievementLevel(totalStars: number): AchievementLevel {
  if (totalStars >= 100) return '卧龙';
  if (totalStars >= 50) return '军师';
  if (totalStars >= 20) return '谋士';
  return '书童';
}

export function checkAndUnlockAchievements(
  progress: PlayerProgress,
  gameMode: GameMode,
  stars: number,
  timeSeconds: number
): PlayerProgress {
  const newProgress = { ...progress };
  const achievements = [...newProgress.achievements];

  // Check first steps
  const totalCompleted = Object.values(newProgress.completedLevels).flat().length;
  if (totalCompleted === 1) {
    unlockAchievement(achievements, 'first-steps');
  }

  // Check mode masters
  const modeLevels = newProgress.completedLevels[gameMode];
  if (modeLevels.length >= 10) {
    if (gameMode === 'round-up') unlockAchievement(achievements, 'round-up-master');
    if (gameMode === 'multiplication') unlockAchievement(achievements, 'multiplication-master');
    if (gameMode === 'balance') unlockAchievement(achievements, 'balance-master');
  }

  // Check star collector
  if (newProgress.totalStars >= 50) {
    unlockAchievement(achievements, 'star-collector');
  }

  // Check perfect warrior
  if (stars === 3) {
    unlockAchievement(achievements, 'perfect-warrior');
  }

  // Check speed demon
  if (timeSeconds <= 30) {
    unlockAchievement(achievements, 'speed-demon');
  }

  // Check master strategist
  const newLevel = calculateAchievementLevel(newProgress.totalStars);
  if (newLevel === '卧龙' && newProgress.currentLevel !== '卧龙') {
    unlockAchievement(achievements, 'master-strategist');
  }

  newProgress.achievements = achievements;
  newProgress.currentLevel = newLevel;

  return newProgress;
}

function unlockAchievement(achievements: Achievement[], id: string): void {
  const achievement = achievements.find(a => a.id === id);
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    achievement.unlockedAt = new Date().toISOString();
  }
}

export function isLevelUnlocked(
  progress: PlayerProgress,
  mode: GameMode,
  level: number
): boolean {
  if (level === 1) return true;
  const completedInMode = progress.completedLevels[mode];
  return completedInMode.includes(level - 1);
}
