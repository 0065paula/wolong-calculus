import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MultiplicationProblem, BlockPosition } from '../../types';
import { soundManager } from '../../utils/sound';

interface MultiplicationGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

// Generate multiplication problem based on level
const generateProblem = (level: number): MultiplicationProblem => {
  const difficulty = Math.min(level, 10);
  let maxA = 5, maxB = 5;
  
  if (difficulty >= 3) { maxA = 6; maxB = 6; }
  if (difficulty >= 5) { maxA = 8; maxB = 8; }
  if (difficulty >= 8) { maxA = 9; maxB = 9; }
  if (difficulty >= 10) { maxA = 12; maxB = 12; }
  
  const a = Math.floor(Math.random() * (maxA - 2)) + 2;
  const b = Math.floor(Math.random() * (maxB - 2)) + 2;
  
  return {
    multiplicand: a,
    multiplier: b,
    product: a * b,
  };
};

export default function MultiplicationGame({ level, onComplete, onExit }: MultiplicationGameProps) {
  const [problem, setProblem] = useState<MultiplicationProblem>(() => generateProblem(level));
  const [revealedBlocks, setRevealedBlocks] = useState<BlockPosition[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [hintMode, setHintMode] = useState(false);

  const targetProblems = 5;
  const stars = problemsSolved >= targetProblems ? 3 : problemsSolved >= 3 ? 2 : problemsSolved >= 1 ? 1 : 0;
  
  const rows = problem.multiplicand;
  const cols = problem.multiplier;
  const totalBlocks = rows * cols;

  useEffect(() => {
    if (problemsSolved >= targetProblems) {
      soundManager.play('level-complete');
      setTimeout(() => onComplete(stars), 1500);
    }
  }, [problemsSolved, stars, onComplete]);

  const animateBlocks = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setRevealedBlocks([]);
    setCurrentStep(0);
    
    // Animate blocks appearing one by one
    const blocks: BlockPosition[] = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        blocks.push({ row: r, col: c, id: `${r}-${c}` });
        setRevealedBlocks([...blocks]);
        soundManager.play('block-stack');
        setCurrentStep(blocks.length);
      }
    }
    
    setTimeout(() => {
      setShowAnswer(true);
      soundManager.play('success');
      setScore(s => s + 100);
      
      setTimeout(() => {
        setProblemsSolved(p => p + 1);
        setProblem(generateProblem(level));
        setRevealedBlocks([]);
        setShowAnswer(false);
        setIsAnimating(false);
        setCurrentStep(0);
      }, 2000);
    }, 500);
  };

  const skipAnimation = () => {
    if (isAnimating) {
      // Generate all blocks at once
      const allBlocks: BlockPosition[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          allBlocks.push({ row: r, col: c, id: `${r}-${c}` });
        }
      }
      setRevealedBlocks(allBlocks);
      setCurrentStep(totalBlocks);
      setShowAnswer(true);
      soundManager.play('success');
      setScore(s => s + 100);
      
      setTimeout(() => {
        setProblemsSolved(p => p + 1);
        setProblem(generateProblem(level));
        setRevealedBlocks([]);
        setShowAnswer(false);
        setIsAnimating(false);
        setCurrentStep(0);
      }, 1500);
    }
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
          onClick={() => setHintMode(!hintMode)}
          className="touch-btn px-4 py-2 bg-[#2f4f4f] text-[#ffd700] rounded-lg hover:bg-[#3f5f5f]"
        >
          提示
        </button>
      </div>

      {/* Problem Display */}
      <motion.div
        className="bamboo-scroll p-4 mb-4 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <p className="text-[#8b6914] text-lg mb-2">奇兵召唤</p>
        <div className="flex items-center justify-center gap-4">
          <motion.span 
            className="number-display text-4xl"
            animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {problem.multiplicand}
          </motion.span>
          <span className="text-3xl text-[#8b6914]">×</span>
          <motion.span 
            className="number-display text-4xl"
            animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1, delay: 0.5 }}
          >
            {problem.multiplier}
          </motion.span>
          <span className="text-3xl text-[#8b6914]">=</span>
          <AnimatePresence mode="wait">
            {showAnswer ? (
              <motion.span
                key="answer"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="number-display text-4xl text-[#228b22]"
              >
                {problem.product}
              </motion.span>
            ) : (
              <motion.span
                key="question"
                className="text-4xl text-[#8b6914]">?</motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-4 text-center">
        <span className="text-[#d4a574]">已召唤: {currentStep}/{totalBlocks} 兵士</span>
        <div className="w-full h-4 bg-[#2f4f4f] rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#ffd700] to-[#b8860b]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalBlocks) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Block Grid */}
      <div className="flex-1 flex items-center justify-center overflow-auto">
        <motion.div
          className="grid gap-1 p-4 bg-[#2f4f4f]/30 rounded-xl"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(30px, 1fr))`,
          }}
        >
          {Array.from({ length: totalBlocks }).map((_, index) => {
            const r = Math.floor(index / cols);
            const c = index % cols;
            const isRevealed = revealedBlocks.some(b => b.row === r && b.col === c);
            
            return (
              <motion.div
                key={index}
                className={`math-block ${isRevealed ? 'opacity-100' : 'opacity-20'}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={isRevealed ? { 
                  scale: 1, 
                  opacity: 1,
                  y: [0, -5, 0]
                } : { scale: 0.5, opacity: 0.2 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 20
                }}
              >
                ⚔️
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-center gap-4">
        <motion.button
          onClick={animateBlocks}
          disabled={isAnimating}
          className="touch-btn px-8 py-4 bg-[#ffd700] text-[#1a3a3a] rounded-xl font-bold text-xl disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={!isAnimating ? { 
            boxShadow: [
              '0 0 10px rgba(255, 215, 0, 0.3)',
              '0 0 25px rgba(255, 215, 0, 0.6)',
              '0 0 10px rgba(255, 215, 0, 0.3)'
            ]
          } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {isAnimating ? '召唤中...' : '召唤奇兵'}
        </motion.button>
        
        {isAnimating && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={skipAnimation}
            className="touch-btn px-4 py-4 bg-[#8b6914] text-[#ffd700] rounded-xl font-bold"
          >
            跳过
          </motion.button>
        )}
      </div>

      {/* Hint */}
      <AnimatePresence>
        {hintMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 bg-[#2f4f4f] p-4 rounded-xl text-center"
          >
            <p className="text-[#d4a574] mb-2">提示：{problem.multiplicand} × {problem.multiplier} = ?</p>
            <p className="text-[#ffd700]">
              {problem.multiplicand} 行，每行 {problem.multiplier} 个 = {problem.product} 个兵士
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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
