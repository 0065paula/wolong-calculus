import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PlayerProgress } from '../types';
import { loadProgress } from '../utils/storage';
import { soundManager } from '../utils/sound';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface MainMenuProps {
  onSelectMode: (mode: 'round-up' | 'multiplication' | 'balance') => void;
  onShowAchievements: () => void;
  onShowSettings: () => void;
}

const gameModes = [
  {
    id: 'round-up' as const,
    name: '破阵篇',
    description: '数字拆分与合并',
    icon: '⚔️',
    color: 'bg-red-600',
  },
  {
    id: 'multiplication' as const,
    name: '奇兵篇',
    description: '乘法视觉化',
    icon: '🔥',
    color: 'bg-blue-600',
  },
  {
    id: 'balance' as const,
    name: '粮草篇',
    description: '加减法平衡桥',
    icon: '⚖️',
    color: 'bg-green-600',
  },
];

export default function MainMenu({ onSelectMode, onShowAchievements, onShowSettings }: MainMenuProps) {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);

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
    return Math.min(completed * 10, 100);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case '书童': return '📚';
      case '谋士': return '🎯';
      case '军师': return '⚔️';
      case '卧龙': return '🐉';
      default: return '📚';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center pt-6"
        >
          <h1 className="text-3xl font-bold text-yellow-400 mb-1">卧龙算略</h1>
          <p className="text-slate-400 text-sm">The Strategist&apos;s Calculus</p>
          
          {progress && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-3xl">{getLevelIcon(progress.currentLevel)}</span>
              <div className="text-left">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  {progress.currentLevel}
                </Badge>
                <p className="text-slate-400 text-xs mt-1">⭐ {progress.totalStars} 星星</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Game Modes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-slate-300 px-1">选择阵法</h2>
          
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card 
                className="bg-slate-800/50 border-slate-700 hover:border-slate-600 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => handleModeSelect(mode.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${mode.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {mode.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white">{mode.name}</h3>
                      <p className="text-slate-400 text-sm">{mode.description}</p>
                      <div className="mt-2">
                        <Progress value={getModeProgress(mode.id)} className="h-2" />
                        <p className="text-xs text-slate-500 mt-1">进度: {getModeProgress(mode.id)}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3"
        >
          <Button 
            variant="outline" 
            className="flex-1 h-12 bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-300"
            onClick={onShowAchievements}
          >
            <span className="mr-2">🏆</span>
            成就
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12 bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-300"
            onClick={onShowSettings}
          >
            <span className="mr-2">⚙️</span>
            设置
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
