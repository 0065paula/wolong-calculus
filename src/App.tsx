import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameMode, PlayerProgress } from './types';
import { loadProgress, saveProgress, checkAndUnlockAchievements } from './utils/storage';
import { soundManager } from './utils/sound';

// Components
import MainMenu from './components/MainMenu';
import LevelSelect from './components/LevelSelect';
import Achievements from './components/Achievements';
import Settings from './components/Settings';
import RoundUpGame from './components/games/RoundUpGame';
import MultiplicationGame from './components/games/MultiplicationGame';
import BalanceGame from './components/games/BalanceGame';

type Screen = 'menu' | 'level-select' | 'achievements' | 'settings' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [progress, setProgress] = useState<PlayerProgress>(loadProgress());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      soundManager.preload();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Save progress when it changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleModeSelect = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    setCurrentScreen('level-select');
  }, []);

  const handleLevelSelect = useCallback((level: number) => {
    setSelectedLevel(level);
    setCurrentScreen('game');
  }, []);

  const handleGameComplete = useCallback((stars: number) => {
    if (!selectedMode) return;

    const timeSeconds = 60; // Placeholder - in real app, track actual time

    setProgress(prev => {
      // Add level to completed if not already there
      const completedLevels = [...prev.completedLevels[selectedMode]];
      if (!completedLevels.includes(selectedLevel)) {
        completedLevels.push(selectedLevel);
      }

      // Calculate new total stars
      const newTotalStars = prev.totalStars + stars;

      // Create updated progress
      const updatedProgress: PlayerProgress = {
        ...prev,
        totalStars: newTotalStars,
        completedLevels: {
          ...prev.completedLevels,
          [selectedMode]: completedLevels,
        },
      };

      // Check for achievements
      const progressWithAchievements = checkAndUnlockAchievements(
        updatedProgress,
        selectedMode,
        stars,
        timeSeconds
      );

      // Play achievement sound if new achievements unlocked
      const newAchievements = progressWithAchievements.achievements.filter(
        a => a.unlocked && !prev.achievements.find(pa => pa.id === a.id)?.unlocked
      );
      if (newAchievements.length > 0) {
        soundManager.play('achievement');
      }

      return progressWithAchievements;
    });

    // Return to level select after a delay
    setTimeout(() => {
      setCurrentScreen('level-select');
    }, 1500);
  }, [selectedMode, selectedLevel]);

  const handleExitGame = useCallback(() => {
    setCurrentScreen('level-select');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setSelectedMode(null);
    setCurrentScreen('menu');
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#1a3a3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { repeat: Infinity, duration: 3, ease: 'linear' },
              scale: { repeat: Infinity, duration: 1.5 }
            }}
          >
            🎋
          </motion.div>
          
          <motion.h1
            className="text-4xl font-bold gold-text mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            卧龙算略
          </motion.h1>
          
          <motion.p
            className="text-[#d4a574]"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            加载中...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#1a3a3a] overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <MainMenu
              onSelectMode={handleModeSelect}
              onShowAchievements={() => setCurrentScreen('achievements')}
              onShowSettings={() => setCurrentScreen('settings')}
            />
          </motion.div>
        )}

        {currentScreen === 'level-select' && selectedMode && (
          <motion.div
            key="level-select"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <LevelSelect
              mode={selectedMode}
              progress={progress}
              onSelectLevel={handleLevelSelect}
              onBack={handleBackToMenu}
            />
          </motion.div>
        )}

        {currentScreen === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Achievements onBack={() => setCurrentScreen('menu')} />
          </motion.div>
        )}

        {currentScreen === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Settings onBack={() => setCurrentScreen('menu')} />
          </motion.div>
        )}

        {currentScreen === 'game' && selectedMode && (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {selectedMode === 'round-up' && (
              <RoundUpGame
                level={selectedLevel}
                onComplete={handleGameComplete}
                onExit={handleExitGame}
              />
            )}
            {selectedMode === 'multiplication' && (
              <MultiplicationGame
                level={selectedLevel}
                onComplete={handleGameComplete}
                onExit={handleExitGame}
              />
            )}
            {selectedMode === 'balance' && (
              <BalanceGame
                level={selectedLevel}
                onComplete={handleGameComplete}
                onExit={handleExitGame}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
