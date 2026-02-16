import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoundUpProblem } from '../../types';
import { soundManager } from '../../utils/sound';

interface RoundUpGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

// Generate problems based on level
const generateProblem = (level: number): RoundUpProblem => {
  const difficulty = Math.min(level, 10);
  const targets = [100, 200, 300, 400, 500, 1000];
  const target = targets[Math.floor((difficulty - 1) / 2) % targets.length];
  
  // Generate numbers that can be combined to reach target
  const base = Math.floor(Math.random() * (target - 50)) + 10;
  const remainder = target - base;
  
  // Always split into exactly 2 numbers for clarity (total 3 numbers including base)
  const split1 = Math.floor(Math.random() * (remainder - 1)) + 1;
  const split2 = remainder - split1;
  
  return {
    target,
    numbers: [base, split1, split2].sort(() => Math.random() - 0.5),
    solution: [base, split1, split2],
    hint: `找出可以凑成 ${target} 的数字`,
  };
};

export default function RoundUpGame({ level, onComplete, onExit }: RoundUpGameProps) {
  const [problem, setProblem] = useState<RoundUpProblem>(() => generateProblem(level));
  const [selected, setSelected] = useState<number[]>([]);
  const [sum, setSum] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [mergedNumbers, setMergedNumbers] = useState<number[]>([]);

  const targetProblems = 5;
  const stars = problemsSolved >= targetProblems ? 3 : problemsSolved >= 3 ? 2 : problemsSolved >= 1 ? 1 : 0;

  useEffect(() => {
    if (problemsSolved >= targetProblems) {
      soundManager.play('level-complete');
      setTimeout(() => onComplete(stars), 1500);
    }
  }, [problemsSolved, stars, onComplete]);

  const handleNumberClick = (_num: number, index: number) => {
    if (selected.includes(index)) {
      // Deselect
      const newSelected = selected.filter(i => i !== index);
      setSelected(newSelected);
      setSum(newSelected.reduce((acc, i) => acc + problem.numbers[i], 0));
      soundManager.play('click');
    } else {
      // Select
      const newSelected = [...selected, index];
      const newSum = newSelected.reduce((acc, i) => acc + problem.numbers[i], 0);
      setSelected(newSelected);
      setSum(newSum);
      soundManager.play('click');

      if (newSum === problem.target) {
        // Success!
        soundManager.play('merge');
        setMergedNumbers(newSelected.map(i => problem.numbers[i]));
        setFeedback('correct');
        setScore(s => s + 100);
        
        setTimeout(() => {
          setProblemsSolved(p => p + 1);
          setProblem(generateProblem(level));
          setSelected([]);
          setSum(0);
          setFeedback(null);
          setMergedNumbers([]);
          setShowHint(false);
        }, 1500);
      } else if (newSum > problem.target) {
        // Too much
        soundManager.play('error');
        setFeedback('wrong');
        setTimeout(() => {
          setSelected([]);
          setSum(0);
          setFeedback(null);
        }, 800);
      }
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
          onClick={() => setShowHint(!showHint)}
          className="touch-btn px-4 py-2 bg-[#2f4f4f] text-[#ffd700] rounded-lg hover:bg-[#3f5f5f]"
        >
          提示
        </button>
      </div>

      {/* Target Display */}
      <motion.div
        className="bamboo-scroll p-6 mb-6 text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <p className="text-[#8b6914] text-lg mb-2">破阵目标</p>
        <motion.div
          className="number-display text-5xl"
          animate={feedback === 'correct' ? { scale: [1, 1.2, 1] } : {}}
        >
          {problem.target}
        </motion.div>
      </motion.div>

      {/* Current Sum */}
      <div className="text-center mb-4">
        <span className="text-[#d4a574] text-xl">当前选择: </span>
        <motion.span
          className={`text-3xl font-bold ${
            sum > problem.target ? 'text-[#c41e3a]' : 'text-[#ffd700]'
          }`}
          animate={feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : {}}
        >
          {sum}
        </motion.span>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#2f4f4f] p-3 rounded-lg mb-4 text-center text-[#d4a574]"
          >
            {problem.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Number Grid */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className={`grid gap-4 ${problem.numbers.length <= 3 ? 'grid-cols-3' : problem.numbers.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {problem.numbers.map((num, index) => (
            <motion.button
              key={`${index}-${num}`}
              onClick={() => handleNumberClick(num, index)}
              className={`touch-btn w-24 h-24 sm:w-20 sm:h-20 rounded-xl text-3xl sm:text-2xl font-bold transition-all duration-300 ${
                selected.includes(index)
                  ? 'bg-[#ffd700] text-[#1a3a3a] shadow-lg scale-110'
                  : 'bg-[#2f4f4f] text-[#ffd700] border-2 border-[#8b6914]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                mergedNumbers.includes(num) && selected.includes(index)
                  ? { 
                      scale: [1, 1.3, 0],
                      opacity: [1, 1, 0],
                      rotate: [0, 10, -10, 0]
                    }
                  : {}
              }
              transition={{ duration: 0.5 }}
            >
              {num}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-center gap-2">
          {Array.from({ length: targetProblems }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-8 h-8 rounded-full border-2 ${
                i < problemsSolved
                  ? 'bg-[#ffd700] border-[#ffd700]'
                  : 'bg-transparent border-[#8b6914]'
              }`}
              initial={i === problemsSolved - 1 ? { scale: 0 } : {}}
              animate={i === problemsSolved - 1 ? { scale: [0, 1.2, 1] } : {}}
            >
              {i < problemsSolved && (
                <span className="flex items-center justify-center h-full text-[#1a3a3a]">✓</span>
              )}
            </motion.div>
          ))}
        </div>
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
