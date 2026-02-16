import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BalanceProblem, BridgeSegment } from '../../types';
import { soundManager } from '../../utils/sound';

interface BalanceGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

// Generate balance problem based on level
const generateProblem = (level: number): BalanceProblem => {
  const difficulty = Math.min(level, 10);
  
  let minTarget = 100, maxTarget = 500;
  if (difficulty >= 3) { minTarget = 200; maxTarget = 800; }
  if (difficulty >= 6) { minTarget = 500; maxTarget = 1500; }
  if (difficulty >= 9) { minTarget = 1000; maxTarget = 3000; }
  
  const target = Math.floor(Math.random() * (maxTarget - minTarget) / 100) * 100 + minTarget;
  const start = Math.floor(Math.random() * (target / 2));
  
  // Generate weights that sum to the difference
  const difference = target - start;
  const weights: number[] = [];
  let remaining = difference;
  
  // Add some standard weights
  const standardWeights = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  
  while (remaining > 0) {
    const maxWeight = standardWeights.filter(w => w <= remaining);
    if (maxWeight.length === 0) break;
    
    const weight = maxWeight[Math.floor(Math.random() * maxWeight.length)];
    weights.push(weight);
    remaining -= weight;
  }
  
  // Shuffle weights
  weights.sort(() => Math.random() - 0.5);
  
  return {
    start,
    target,
    current: start,
    weights,
    selectedWeights: [],
  };
};

export default function BalanceGame({ level, onComplete, onExit }: BalanceGameProps) {
  const [problem, setProblem] = useState<BalanceProblem>(() => generateProblem(level));
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [totalAdded, setTotalAdded] = useState(0);
  const [bridgeSegments, setBridgeSegments] = useState<BridgeSegment[]>([]);
  const [isCrossing, setIsCrossing] = useState(false);
  const [score, setScore] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const targetProblems = 5;
  const stars = problemsSolved >= targetProblems ? 3 : problemsSolved >= 3 ? 2 : problemsSolved >= 1 ? 1 : 0;
  
  const currentValue = problem.start + totalAdded;
  const remainingNeeded = problem.target - currentValue;

  useEffect(() => {
    // Initialize bridge segments
    const segments: BridgeSegment[] = [];
    const gap = problem.target - problem.start;
    const segmentCount = 5;
    
    for (let i = 0; i < segmentCount; i++) {
      const segmentValue = Math.floor(gap / segmentCount);
      segments.push({
        value: segmentValue,
        filled: false,
        position: i,
      });
    }
    setBridgeSegments(segments);
  }, [problem]);

  useEffect(() => {
    // Update bridge segments based on progress
    const gap = problem.target - problem.start;
    const progress = totalAdded / gap;
    
    setBridgeSegments(prev => 
      prev.map((seg, idx) => ({
        ...seg,
        filled: (idx + 1) / prev.length <= progress,
      }))
    );
  }, [totalAdded, problem]);

  useEffect(() => {
    if (problemsSolved >= targetProblems) {
      soundManager.play('level-complete');
      setTimeout(() => onComplete(stars), 1500);
    }
  }, [problemsSolved, stars, onComplete]);

  const handleWeightClick = (weight: number, _index: number) => {
    if (isCrossing) return;
    
    const newSelected = [...selectedWeights, weight];
    const newTotal = totalAdded + weight;
    
    setSelectedWeights(newSelected);
    setTotalAdded(newTotal);
    soundManager.play('metal-hit');
    
    if (newTotal === problem.target - problem.start) {
      // Success!
      soundManager.play('bridge-creak');
      setFeedback('correct');
      setIsCrossing(true);
      setScore(s => s + 100);
      
      setTimeout(() => {
        setProblemsSolved(p => p + 1);
        setProblem(generateProblem(level));
        setSelectedWeights([]);
        setTotalAdded(0);
        setIsCrossing(false);
        setFeedback(null);
        setShowHint(false);
      }, 2000);
    } else if (newTotal > problem.target - problem.start) {
      // Too much
      soundManager.play('error');
      setFeedback('wrong');
      
      setTimeout(() => {
        setSelectedWeights([]);
        setTotalAdded(0);
        setFeedback(null);
      }, 1000);
    }
  };

  const handleReset = () => {
    setSelectedWeights([]);
    setTotalAdded(0);
    soundManager.play('click');
  };

  return (
    <div className="game-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onExit}
          className="touch-btn px-4 py-2 bg-[#8b6914] text-[#ffd700] rounded-lg font-bold hover:bg-[#6b4f0a]"
        >
          退出
        </button>
        <div className="flex gap-4">
          <span className="text-[#ffd700]">关卡 {level}</span>
          <span className="text-[#ffd700]">得分: {score}</span>
          <span className="text-[#ffd700]">进度: {problemsSolved}/{targetProblems}</span>
        </div>
        <button
          onClick={() => setShowHint(!showHint)}
          className="touch-btn px-4 py-2 bg-[#2f4f4f] text-[#ffd700] rounded-lg hover:bg-[#3f5f5f]"
        >
          提示
        </button>
      </div>

      {/* Bridge Display */}
      <motion.div
        className="bamboo-scroll p-4 mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <p className="text-[#8b6914] text-center text-lg mb-2">粮草运输桥</p>
        
        <div className="flex items-center justify-between gap-4">
          {/* Start */}
          <motion.div
            className="weight-stone w-16 h-16 flex-shrink-0"
            animate={isCrossing ? { x: [0, 200, 400] } : {}}
            transition={{ duration: 2 }}
          >
            <span className="text-sm">{problem.start}</span>
          </motion.div>
          
          {/* Bridge */}
          <div className="flex-1 flex items-center gap-1">
            {bridgeSegments.map((seg, idx) => (
              <motion.div
                key={idx}
                className={`h-4 flex-1 rounded transition-all ${
                  seg.filled
                    ? 'bg-gradient-to-r from-[#8b6914] to-[#d4a574]'
                    : 'bg-[#2f4f4f] border-2 border-dashed border-[#8b6914]'
                }`}
                animate={seg.filled ? { 
                  backgroundColor: ['#2f4f4f', '#8b6914', '#d4a574'],
                } : {}}
              />
            ))}
          </div>
          
          {/* Target */}
          <motion.div
            className="weight-stone w-16 h-16 flex-shrink-0 bg-gradient-to-br from-[#ffd700] to-[#b8860b]"
            animate={feedback === 'correct' ? { 
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 10px rgba(255, 215, 0, 0.5)',
                '0 0 30px rgba(255, 215, 0, 0.8)',
                '0 0 10px rgba(255, 215, 0, 0.5)'
              ]
            } : {}}
          >
            <span className="text-sm text-[#1a3a3a]">{problem.target}</span>
          </motion.div>
        </div>
        
        {/* Gap indicator */}
        <div className="text-center mt-3">
          <span className="text-[#d4a574]">还需: </span>
          <motion.span
            className={`text-2xl font-bold ${
              remainingNeeded < 0 ? 'text-[#c41e3a]' : 'text-[#ffd700]'
            }`}
            animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : {}}
          >
            {remainingNeeded}
          </motion.span>
        </div>
      </motion.div>

      {/* Selected weights display */}
      <div className="mb-4 min-h-[60px]">
        <p className="text-[#d4a574] mb-2">已添加砝码: {selectedWeights.join(' + ')} = {totalAdded}</p>
        <div className="flex gap-2 flex-wrap">
          {selectedWeights.map((weight, idx) => (
            <motion.div
              key={`${idx}-${weight}`}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="weight-stone w-10 h-10 text-xs"
            >
              {weight}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#2f4f4f] p-3 rounded-lg mb-4 text-center"
          >
            <p className="text-[#d4a574]">
              目标 {problem.target} - 起点 {problem.start} = 需要 {problem.target - problem.start}
            </p>
            <p className="text-[#ffd700] mt-1">选择合适的砝码组合来填补差距</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weight Selection */}
      <div className="flex-1 overflow-auto">
        <p className="text-[#d4a574] mb-2">可用砝码：</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {problem.weights.map((weight, index) => (
            <motion.button
              key={`${index}-${weight}`}
              onClick={() => handleWeightClick(weight, index)}
              disabled={isCrossing}
              className="touch-btn weight-stone h-14 disabled:opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              +{weight}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-center">
        <motion.button
          onClick={handleReset}
          disabled={isCrossing || selectedWeights.length === 0}
          className="touch-btn px-6 py-3 bg-[#c41e3a] text-[#ffd700] rounded-xl font-bold disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          重置选择
        </motion.button>
      </div>

      {/* Progress Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: targetProblems }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full ${
              i < problemsSolved
                ? 'bg-[#ffd700]'
                : 'bg-[#2f4f4f] border border-[#8b6914]'
            }`}
            initial={i === problemsSolved - 1 ? { scale: 0 } : {}}
            animate={i === problemsSolved - 1 ? { scale: [0, 1.5, 1] } : {}}
          />
        ))}
      </div>

      {/* Level Complete Overlay */}
      <AnimatePresence>
        {problemsSolved >= targetProblems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bamboo-scroll p-8 text-center"
            >
              <h2 className="text-3xl font-bold text-[#8b6914] mb-4">关卡完成！</h2>
              <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className={`text-4xl ${
                      i < stars ? 'text-[#ffd700]' : 'text-[#8b6914]'
                    }`}
                  >
                    ★
                  </motion.span>
                ))}
              </div>
              <p className="text-[#8b6914]">获得 {stars} 星评价！</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
