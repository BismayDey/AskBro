import React, { useState } from "react";
import {
  Code,
  MessageCircle,
  Palette,
  Calculator,
  Lightbulb,
  BookOpen,
  Zap,
  Sparkles,
  Brain,
  ChevronRight,
  Star,
  Clock,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Mode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  features: string[];
  isCodeGenerator: boolean;
  prompt: string;
}

interface ModeData {
  prompt: string;
  features: string[];
  description: string;
}

interface ModeSelectorProps {
  onSelectMode: (
    isCodeGenerator: boolean,
    modeName: string,
    modeData?: ModeData
  ) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const modes: Mode[] = [
    {
      id: "chat",
      name: "Casual Chat",
      description: "Friendly conversations and general assistance",
      icon: <MessageCircle size={24} />,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      features: [
        "Natural conversations",
        "General questions",
        "Friendly advice",
        "Casual discussions",
      ],
      isCodeGenerator: false,
      prompt: "casual",
    },
    {
      id: "code-elite",
      name: "Elite Code Generator",
      description: "Advanced code generation with best practices",
      icon: <Code size={24} />,
      color: "from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      features: [
        "Production-ready code",
        "Best practices",
        "Multiple languages",
        "Full-stack solutions",
      ],
      isCodeGenerator: true,
      prompt: "elite-code",
    },
    {
      id: "creative",
      name: "Creative Writing",
      description: "Stories, poems, and creative content",
      icon: <Palette size={24} />,
      color: "from-purple-500 to-pink-600",
      hoverColor: "hover:from-purple-600 hover:to-pink-700",
      features: [
        "Stories & narratives",
        "Poetry generation",
        "Creative writing",
        "Content ideas",
      ],
      isCodeGenerator: false,
      prompt: "creative",
    },
    {
      id: "math-expert",
      name: "Math & Science",
      description: "Mathematical problems and scientific explanations",
      icon: <Calculator size={24} />,
      color: "from-orange-500 to-red-600",
      hoverColor: "hover:from-orange-600 hover:to-red-700",
      features: [
        "Problem solving",
        "Scientific explanations",
        "Calculations",
        "Data analysis",
      ],
      isCodeGenerator: false,
      prompt: "math-science",
    },
    {
      id: "problem-solver",
      name: "Problem Solver",
      description: "Strategic thinking and complex problem resolution",
      icon: <Lightbulb size={24} />,
      color: "from-yellow-500 to-amber-600",
      hoverColor: "hover:from-yellow-600 hover:to-amber-700",
      features: [
        "Strategic analysis",
        "Complex problems",
        "Decision making",
        "Optimization",
      ],
      isCodeGenerator: false,
      prompt: "problem-solver",
    },
    {
      id: "researcher",
      name: "Research Assistant",
      description: "In-depth research and academic support",
      icon: <BookOpen size={24} />,
      color: "from-indigo-500 to-purple-600",
      hoverColor: "hover:from-indigo-600 hover:to-purple-700",
      features: [
        "Research summaries",
        "Academic writing",
        "Data synthesis",
        "Literature review",
      ],
      isCodeGenerator: false,
      prompt: "researcher",
    },
    {
      id: "speed-demon",
      name: "Speed Mode",
      description: "Fast responses with quick solutions",
      icon: <Zap size={24} />,
      color: "from-cyan-500 to-blue-600",
      hoverColor: "hover:from-cyan-600 hover:to-blue-700",
      features: [
        "Lightning fast",
        "Quick solutions",
        "Direct answers",
        "Efficiency focused",
      ],
      isCodeGenerator: false,
      prompt: "speed",
    },
    {
      id: "visionary",
      name: "Visionary AI",
      description: "Innovative ideas and future-thinking",
      icon: <Sparkles size={24} />,
      color: "from-pink-500 to-rose-600",
      hoverColor: "hover:from-pink-600 hover:to-rose-700",
      features: [
        "Innovative ideas",
        "Future trends",
        "Creative solutions",
        "Visionary thinking",
      ],
      isCodeGenerator: false,
      prompt: "visionary",
    },
    {
      id: "mentor",
      name: "AI Mentor",
      description: "Learning and skill development guidance",
      icon: <Brain size={24} />,
      color: "from-teal-500 to-cyan-600",
      hoverColor: "hover:from-teal-600 hover:to-cyan-700",
      features: [
        "Skill development",
        "Learning paths",
        "Code reviews",
        "Career advice",
      ],
      isCodeGenerator: false,
      prompt: "mentor",
    },
  ];

  const handleModeSelect = (mode: Mode) => {
    setSelectedMode(mode.id);
    setTimeout(() => {
      onSelectMode(mode.isCodeGenerator, mode.name, {
        prompt: mode.prompt,
        features: mode.features,
        description: mode.description,
      });
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-6">
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2"
        >
          Choose Your AI Experience
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400"
        >
          Select a mode that best fits your needs. Each mode is optimized for
          specific tasks.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative group cursor-pointer rounded-xl border-2 border-transparent bg-gradient-to-br ${
              mode.color
            } p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
              mode.hoverColor
            } ${
              selectedMode === mode.id
                ? "ring-4 ring-white/50 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800"
                : ""
            }`}
            onClick={() => handleModeSelect(mode)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">{mode.icon}</div>
                <div>
                  <h4 className="font-semibold text-lg">{mode.name}</h4>
                  <div className="flex items-center gap-1 text-sm opacity-90">
                    {mode.isCodeGenerator && (
                      <Star size={12} className="text-yellow-300" />
                    )}
                    <span>{mode.description}</span>
                  </div>
                </div>
              </div>
              <ChevronRight
                size={20}
                className={`transition-transform duration-300 ${
                  selectedMode === mode.id
                    ? "rotate-90"
                    : "group-hover:translate-x-1"
                }`}
              />
            </div>

            <div className="space-y-2">
              {mode.features.slice(0, 2).map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm opacity-90"
                >
                  <Target size={12} className="text-white/70" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {selectedMode === mode.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-white/20"
                >
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Clock size={14} />
                    <span>Advanced Features:</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {mode.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs opacity-80"
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedMode === mode.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400"
      >
        💡 <strong>Pro tip:</strong> You can change modes anytime by clicking
        the mode indicator in the header
      </motion.div>
    </motion.div>
  );
};
