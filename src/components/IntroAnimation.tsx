import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export const IntroAnimation: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center gap-6"
    >
      <motion.div
        variants={iconVariants}
        className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg"
      >
        <MessageSquare className="text-white" size={48} />
      </motion.div>
      <motion.div className="text-center" variants={itemVariants}>
        <motion.h1 
          className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent"
        >
          Ask Bro
        </motion.h1>
        <motion.p 
          className="mt-2 text-lg text-gray-600 dark:text-gray-300"
        >
          Your AI companion powered by DeepSeek
        </motion.p>
      </motion.div>
    </motion.div>
  );
};