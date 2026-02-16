import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PlayerProgress } from '../types';
import { loadProgress } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface MainMenuProps {
  onSelectMode: (mode: 'round-up' | 'multiplication' | 'balance') => void;
  onShowAchievements: () => void;
  onShowSettings: () => void;
}

const gameModes: { id: 'round-up' | 'multiplication' | 'balance'; name: string; description: string; icon: string; color: string }[] = [
  {
    id: 'round-up',
    name: '破阵篇',
    description: '数字拆分与合并',
    icon: '⚔️',
    color: '#c41e3a',
  },
  {
    id: 'multiplication',
    name: '奇兵篇',
    description: '乘法视觉化',
    icon: '🔥',
    color: '#4169e1',
  },
  {
    id: 'balance',
    name: '粮草篇',
    description: '加减法平衡桥',
    icon: '⚖️',
    color: '#228b22',
  },
];

export default function MainMenu({ onSelectMode, onShowAchievements, onShowSettings }: MainMenuProps) {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
    soundManager.preload();
  }, []);

  const handleModeSelect = (mode: 'round-up' | 'multiplication' | 'balance') => {
    soundManager.play('click');
    onSelectMode(mode);
  };

  const getModeProgress = (mode: 'round-up' | 'multiplication' | 'balance') => {
    if (!progress) return 0;
    const completed = progress.completedLevels[mode]?.length || 0;
    return Math.min(completed * 10, 100); // 10 levels per mode
  };

  return (
    <div className="game-container overflow-y-auto">
      {/* Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-6xl font-bold gold-text mb-2">卧龙算略</h1>
        <p className="text-[#d4a574] text-lg">The Strategist&apos;s Calculus</p>
        
        {progress && (
          <div className="mt-4 flex justify-center items-center gap-4">
            <div className="achievement-badge">
              <span className="text-2xl">{progress.currentLevel === '书童' ? '📚' : progress.currentLevel === '谋士' ? '🎯' : progress.currentLevel === '军师' ? '⚔️' : '🐉'}</span>
            </div>
            <div className="text-left">
              <p className="text-[#ffd700] font-bold">{progress.currentLevel}</p>
              <p className="text-[#d4a574] text-sm">⭐ {progress.totalStars} 星星</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Game Modes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {gameModes.map((mode, index) => (
          <motion.button
            key={mode.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleModeSelect(mode.id)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
            className="touch-btn bamboo-scroll p-6 text-center group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="text-5xl mb-3"
              animate={hoveredMode === mode.id ? { 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0]
              } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              {mode.icon}
            </motion.div>
            
            <h2 className="text-2xl font-bold text-[#8b6914] mb-2">{mode.name}</h2>
            <p className="text-[#8b6914]/70 mb-4">{mode.description}</p>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-[#d4a574]/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: mode.color }}
                initial={{ width: 0 }}
                animate={{ width: `${getModeProgress(mode.id)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-xs text-[#8b6914]/50 mt-1">
              进度: {getModeProgress(mode.id)}%
            </p>
          </motion.button>
        ))}
      </div>

      {/* Bottom Menu */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-4"
      >
        <motion.button
          onClick={onShowAchievements}
          className="touch-btn px-6 py-3 bg-[#2f4f4f] text-[#ffd700] rounded-xl font-bold flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>🏆</span>
          <span>成就</span>
        </motion.button>
        
        <motion.button
          onClick={onShowSettings}
          className="touch-btn px-6 py-3 bg-[#2f4f4f] text-[#ffd700] rounded-xl font-bold flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>⚙️</span>
          <span>设置</span>
        </motion.button>
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 left-4 text-6xl opacity-20 pointer-events-none"
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        🎋
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 right-4 text-6xl opacity-20 pointer-events-none"
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
      >
        🏯
      </motion.div>
    </div>
  );
}
