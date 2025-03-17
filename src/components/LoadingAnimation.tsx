import React from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  error?: boolean;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ error }) => {
  const dotVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
  };

  return (
    <div className="flex items-center gap-2 p-4">
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {error ? "Bro is busy" : "Bro is thinking"}
      </span>
      {!error && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              variants={dotVariants}
              animate="animate"
              className="w-2 h-2 rounded-full bg-blue-500"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};