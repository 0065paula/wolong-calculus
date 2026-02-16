import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { soundManager } from '../utils/sound';
import { clearProgress } from '../utils/storage';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(50);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const savedEnabled = localStorage.getItem('wolong-sound-enabled') !== 'false';
    const savedVolume = parseInt(localStorage.getItem('wolong-sound-volume') || '50');
    setSoundEnabled(savedEnabled);
    setVolume(savedVolume * 100);
  }, []);

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    soundManager.setEnabled(newValue);
    if (newValue) {
      soundManager.play('click');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume / 100);
    if (soundEnabled) {
      soundManager.play('click');
    }
  };

  const handleResetProgress = () => {
    clearProgress();
    localStorage.removeItem('wolong-sound-enabled');
    localStorage.removeItem('wolong-sound-volume');
    setShowResetConfirm(false);
    soundManager.play('click');
    // Reload to reset state
    window.location.reload();
  };

  return (
    <div className="game-container overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <motion.button
          onClick={onBack}
          className="touch-btn px-4 py-2 bg-[#8b6914] text-[#ffd700] rounded-lg font-bold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← 返回
        </motion.button>
        
        <div className="flex-1 text-center">
          <h2 className="text-3xl font-bold gold-text">⚙️ 设置</h2>
        </div>
        
        <div className="w-20" />
      </div>

      {/* Settings Options */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Sound Toggle */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bamboo-scroll p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔊</span>
              <div>
                <h3 className="font-bold text-[#8b6914]">音效</h3>
                <p className="text-sm text-[#8b6914]/70">游戏音效开关</p>
              </div>
            </div>
            
            <motion.button
              onClick={handleSoundToggle}
              className={`touch-btn w-14 h-8 rounded-full relative transition-colors ${
                soundEnabled ? 'bg-[#228b22]' : 'bg-[#2f4f4f]'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-6 h-6 bg-[#ffd700] rounded-full absolute top-1"
                animate={{ left: soundEnabled ? '26px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Volume Slider */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bamboo-scroll p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔉</span>
            <div>
              <h3 className="font-bold text-[#8b6914]">音量</h3>
              <p className="text-sm text-[#8b6914]/70">调整音效大小</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[#8b6914]">🔇</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!soundEnabled}
              className="flex-1 h-2 bg-[#2f4f4f] rounded-lg appearance-none cursor-pointer accent-[#ffd700] disabled:opacity-50"
            />
            <span className="text-[#8b6914]">🔊</span>
            <span className="text-[#ffd700] font-bold w-12 text-right">{volume}%</span>
          </div>
        </motion.div>

        {/* Test Sound */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bamboo-scroll p-4"
        >
          <h3 className="font-bold text-[#8b6914] mb-3">🎵 测试音效</h3>
          
          <div className="grid grid-cols-3 gap-2">
            {['click', 'success', 'error', 'merge', 'metal-hit', 'achievement'].map((sound) => (
              <motion.button
                key={sound}
                onClick={() => soundEnabled && soundManager.play(sound as any)}
                disabled={!soundEnabled}
                className="touch-btn px-3 py-2 bg-[#2f4f4f] text-[#ffd700] rounded-lg text-sm disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {sound}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Reset Progress */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bamboo-scroll p-4 border-2 border-[#c41e3a]/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗑️</span>
              <div>
                <h3 className="font-bold text-[#c41e3a]">重置进度</h3>
                <p className="text-sm text-[#8b6914]/70">清除所有游戏数据</p>
              </div>
            </div>
            
            <motion.button
              onClick={() => setShowResetConfirm(true)}
              className="touch-btn px-4 py-2 bg-[#c41e3a] text-[#ffd700] rounded-lg font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              重置
            </motion.button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bamboo-scroll p-4 text-center"
        >
          <p className="text-[#8b6914]/70 text-sm">卧龙算略 v1.0</p>
          <p className="text-[#8b6914]/50 text-xs mt-1">
            The Strategist's Calculus - Math Learning Game
          </p>
          <p className="text-[#8b6914]/50 text-xs mt-1">
            为6-8岁儿童设计的数学学习游戏
          </p>
        </motion.div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bamboo-scroll p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-5xl mb-4 text-center">⚠️</div>
            
            <h3 className="text-xl font-bold text-[#c41e3a] mb-2 text-center">确认重置？</h3>
            
            <p className="text-[#8b6914]/70 text-center mb-6">
              这将清除所有游戏进度、成就和设置。此操作无法撤销。
            </p>
            
            <div className="flex gap-3">
              <motion.button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 touch-btn py-3 bg-[#2f4f4f] text-[#ffd700] rounded-lg font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                取消
              </motion.button>
              
              <motion.button
                onClick={handleResetProgress}
                className="flex-1 touch-btn py-3 bg-[#c41e3a] text-[#ffd700] rounded-lg font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                确认重置
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
