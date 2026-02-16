import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameMode } from '../types';
import { isLevelUnlocked } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface LevelSelectProps {
  mode: GameMode;
  progress: { completedLevels: Record<GameMode, number[]>; totalStars: number };
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

const modeInfo: Record<GameMode, { name: string; description: string; icon: string }> = {
  'round-up': {
    name: '破阵篇',
    description: '数字拆分与合并',
    icon: '⚔️',
  },
  'multiplication': {
    name: '奇兵篇',
    description: '乘法视觉化',
    icon: '🔥',
  },
  'balance': {
    name: '粮草篇',
    description: '加减法平衡桥',
    icon: '⚖️',
  },
};

const TOTAL_LEVELS = 10;

export default function LevelSelect({ mode, progress, onSelectLevel, onBack }: LevelSelectProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const info = modeInfo[mode];
  const completedLevels = progress.completedLevels[mode] || [];

  const handleLevelClick = (level: number) => {
    if (!isLevelUnlocked({ ...progress, achievements: [], currentLevel: '书童', lastPlayed: '' }, mode, level)) {
      soundManager.play('error');
      return;
    }
    soundManager.play('click');
    setSelectedLevel(level);
  };

  const handleConfirm = () => {
    if (selectedLevel) {
      soundManager.play('click');
      onSelectLevel(selectedLevel);
    }
  };

  const getStarsForLevel = (level: number): number => {
    // Simplified - in real app, track stars per level
    if (completedLevels.includes(level)) {
      return Math.floor(Math.random() * 2) + 2; // 2-3 stars for completed
    }
    return 0;
  };

  return (
    <div className="game-container overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          onClick={onBack}
          className="touch-btn px-4 py-2 bg-[#8b6914] text-[#ffd700] rounded-lg font-bold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← 返回
        </motion.button>
        
        <div className="flex-1 text-center">
          <h2 className="text-3xl font-bold gold-text">{info.name}</h2>
          <p className="text-[#d4a574]">{info.description}</p>
        </div>
        
        <div className="w-20" /> {/* Spacer for alignment */}
      </div>

      {/* Level Grid */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {Array.from({ length: TOTAL_LEVELS }).map((_, index) => {
            const level = index + 1;
            const unlocked = isLevelUnlocked(
              { ...progress, achievements: [], currentLevel: '书童', lastPlayed: '' },
              mode,
              level
            );
            const completed = completedLevels.includes(level);
            const stars = getStarsForLevel(level);
            const isSelected = selectedLevel === level;

            return (
              <motion.button
                key={level}
                onClick={() => handleLevelClick(level)}
                disabled={!unlocked}
                className={`touch-btn relative w-20 h-20 rounded-xl flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#ffd700] text-[#1a3a3a] scale-110 shadow-lg shadow-[#ffd700]/50'
                    : completed
                    ? 'bg-[#228b22] text-[#ffd700]'
                    : unlocked
                    ? 'bg-[#2f4f4f] text-[#ffd700] border-2 border-[#8b6914]'
                    : 'bg-[#1a3a3a] text-[#8b6914]/50 border-2 border-[#2f4f4f]'
                }`}
                whileHover={unlocked ? { scale: 1.1 } : {}}
                whileTap={unlocked ? { scale: 0.9 } : {}}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {unlocked ? (
                  <>
                    <span className="text-2xl font-bold">{level}</span>
                    {completed && (
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${
                              i < stars ? 'text-[#ffd700]' : 'text-[#1a3a3a]/30'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-2xl">🔒</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Level Info */}
      {selectedLevel && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 bamboo-scroll p-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-[#8b6914]">关卡 {selectedLevel}</h3>
              <p className="text-[#8b6914]/70">
                {completedLevels.includes(selectedLevel) ? '已完成 - 可重新挑战' : '新关卡'}
              </p>
            </div>
            <motion.button
              onClick={handleConfirm}
              className="touch-btn px-8 py-3 bg-[#ffd700] text-[#1a3a3a] rounded-xl font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(255, 215, 0, 0.3)',
                  '0 0 25px rgba(255, 215, 0, 0.6)',
                  '0 0 10px rgba(255, 215, 0, 0.3)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              开始挑战
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
