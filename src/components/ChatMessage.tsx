import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`flex gap-4 p-6 rounded-lg ${
        isUser 
          ? 'bg-white dark:bg-gray-800 shadow-sm' 
          : 'bg-blue-50 dark:bg-gray-700/50'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
      }`}>
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      <div className="flex-1 prose dark:prose-invert max-w-none">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </motion.div>
  );
};