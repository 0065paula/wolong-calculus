import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Achievement, PlayerProgress } from '../types';
import { loadProgress } from '../utils/storage';
import { soundManager } from '../utils/sound';

interface AchievementsProps {
  onBack: () => void;
}

export default function Achievements({ onBack }: AchievementsProps) {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const unlockedCount = progress?.achievements.filter(a => a.unlocked).length || 0;
  const totalCount = progress?.achievements.length || 0;

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
          <h2 className="text-3xl font-bold gold-text">🏆 成就殿堂</h2>
          <p className="text-[#d4a574]">
            已解锁: {unlockedCount} / {totalCount}
          </p>
        </div>
        
        <div className="w-20" />
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {progress?.achievements.map((achievement, index) => (
          <motion.button
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              soundManager.play('click');
              setSelectedAchievement(achievement);
            }}
            className={`touch-btn p-4 rounded-xl text-left transition-all ${
              achievement.unlocked
                ? 'bg-gradient-to-r from-[#ffd700]/20 to-[#b8860b]/20 border-2 border-[#ffd700]'
                : 'bg-[#2f4f4f]/50 border-2 border-[#8b6914]/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className={`text-4xl ${achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}
                animate={achievement.unlocked ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {achievement.icon}
              </motion.div>
              
              <div className="flex-1">
                <h3 className={`font-bold ${achievement.unlocked ? 'text-[#ffd700]' : 'text-[#8b6914]/50'}`}>
                  {achievement.name}
                </h3>
                <p className={`text-sm ${achievement.unlocked ? 'text-[#d4a574]' : 'text-[#8b6914]/30'}`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-[#8b6914]/50 mt-1">
                    解锁于: {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                  </p>
                )}
              </div>
              
              {achievement.unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[#ffd700] text-2xl"
                >
                  ✓
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bamboo-scroll p-8 max-w-md w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={selectedAchievement.unlocked ? {
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0],
              } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {selectedAchievement.icon}
            </motion.div>
            
            <h3 className="text-2xl font-bold text-[#8b6914] mb-2">
              {selectedAchievement.name}
            </h3>
            
            <p className="text-[#8b6914]/70 mb-4">
              {selectedAchievement.description}
            </p>
            
            {selectedAchievement.unlocked ? (
              <div className="bg-[#228b22]/20 p-3 rounded-lg">
                <p className="text-[#228b22] font-bold">✓ 已解锁</p>
                {selectedAchievement.unlockedAt && (
                  <p className="text-sm text-[#8b6914]/50">
                    {new Date(selectedAchievement.unlockedAt).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-[#2f4f4f]/50 p-3 rounded-lg">
                <p className="text-[#8b6914]/50">🔒 未解锁</p>
                <p className="text-sm text-[#8b6914]/30 mt-1">
                  继续游戏以解锁此成就
                </p>
              </div>
            )}
            
            <motion.button
              onClick={() => setSelectedAchievement(null)}
              className="mt-6 touch-btn px-6 py-2 bg-[#8b6914] text-[#ffd700] rounded-lg font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              关闭
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {/* Rank Progress */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bamboo-scroll p-4"
      >
        <h3 className="text-xl font-bold text-[#8b6914] mb-4 text-center">等级进度</h3>
        
        <div className="flex justify-between items-center mb-2">
          {['书童', '谋士', '军师', '卧龙'].map((rank, i) => {
            const currentRank = progress?.currentLevel || '书童';
            const rankIndex = ['书童', '谋士', '军师', '卧龙'].indexOf(currentRank);
            const isActive = i <= rankIndex;
            
            return (
              <motion.div
                key={rank}
                className={`flex flex-col items-center ${isActive ? 'opacity-100' : 'opacity-40'}`}
                animate={isActive && i === rankIndex ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="text-2xl">
                  {rank === '书童' ? '📚' : rank === '谋士' ? '🎯' : rank === '军师' ? '⚔️' : '🐉'}
                </span>
                <span className={`text-xs mt-1 ${isActive ? 'text-[#ffd700]' : 'text-[#8b6914]'}`}>
                  {rank}
                </span>
              </motion.div>
            );
          })}
        </div>
        
        <div className="h-3 bg-[#2f4f4f] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#ffd700] to-[#b8860b]"
            initial={{ width: 0 }}
            animate={{ width: `${((progress?.totalStars || 0) / 100) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        
        <p className="text-center text-[#8b6914]/70 text-sm mt-2">
          {progress?.totalStars || 0} / 100 星星达到卧龙
        </p>
      </motion.div>
    </div>
  );
}
