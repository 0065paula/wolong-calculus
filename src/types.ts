// Types for the Three Kingdoms Math Game - 卧龙算略

export type GameMode = 'round-up' | 'multiplication' | 'balance';

export type AchievementLevel = '书童' | '谋士' | '军师' | '卧龙';

export interface PlayerProgress {
  totalStars: number;
  completedLevels: Record<GameMode, number[]>;
  achievements: Achievement[];
  currentLevel: AchievementLevel;
  lastPlayed: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GameState {
  mode: GameMode;
  level: number;
  score: number;
  stars: number;
  isComplete: boolean;
  startTime: number;
  endTime?: number;
}

// Round Up Magic Game Types
export interface RoundUpProblem {
  target: number;
  numbers: number[];
  solution: number[];
  hint: string;
}

export interface RoundUpState extends GameState {
  currentProblem: RoundUpProblem;
  selectedNumbers: number[];
  mergedNumber: number | null;
  animationState: 'idle' | 'splitting' | 'merging' | 'complete';
}

// Multiplication Clone Game Types
export interface MultiplicationProblem {
  multiplicand: number;
  multiplier: number;
  product: number;
}

export interface BlockPosition {
  row: number;
  col: number;
  id: string;
}

export interface MultiplicationState extends GameState {
  currentProblem: MultiplicationProblem;
  revealedBlocks: BlockPosition[];
  isAnimating: boolean;
  currentStep: number;
}

// Balance Bridge Game Types
export interface BalanceProblem {
  start: number;
  target: number;
  current: number;
  weights: number[];
  selectedWeights: number[];
}

export interface BridgeSegment {
  value: number;
  filled: boolean;
  position: number;
}

export interface BalanceState extends GameState {
  currentProblem: BalanceProblem;
  bridgeSegments: BridgeSegment[];
  totalAdded: number;
  animationState: 'idle' | 'adding' | 'crossing' | 'complete';
}

// Sound Types
export type SoundType = 
  | 'click'
  | 'success'
  | 'error'
  | 'merge'
  | 'split'
  | 'metal-hit'
  | 'smoke'
  | 'block-stack'
  | 'bridge-creak'
  | 'level-complete'
  | 'achievement';

// Level configuration
export interface LevelConfig {
  mode: GameMode;
  level: number;
  starsRequired: number;
  description: string;
}

// Game settings
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}
