import React, { useState, useRef, useEffect } from "react";
import { Send, Code, MessageCircle, RotateCcw, Edit3 } from "lucide-react";
import { Message, ChatResponse, Theme, UserSettings } from "./types";
import { ChatMessage } from "./components/ChatMessage";
import { IntroAnimation } from "./components/IntroAnimation";
import { ThemeToggle } from "./components/ThemeToggle";
import { LoadingAnimation } from "./components/LoadingAnimation";
import { AuthModal } from "./components/AuthModal";
import { UserProfile } from "./components/UserProfile";
import { SettingsModal } from "./components/SettingsModal";
import { ModeSelector } from "./components/ModeSelector";
import { auth, db, firestore } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, set, push } from "firebase/database";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { fetchAIResponse } from "./utils/ai";

const API_KEY = import.meta.env.VITE_API_KEY;

interface ModeData {
  prompt: string;
  features: string[];
  description: string;
}

const defaultSettings: UserSettings = {
  theme: "system",
  fontSize: "medium",
  messageSpacing: "comfortable",
  soundEnabled: true,
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [error, setError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [user] = useAuthState(auth);
  const [userSettings, setUserSettings] =
    useState<UserSettings>(defaultSettings);
  const [isCodeGenerator, setIsCodeGenerator] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>("Not Selected");
  const [currentModeData, setCurrentModeData] = useState<ModeData | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showIntro && user && messages.length === 0) {
      const userName = user?.displayName || user?.email?.split("@")[0];
      const welcomeMessage: Message = {
        role: "assistant",
        content: `👋 **Hey there${
          userName ? ` ${userName}` : ""
        }! I'm Bro, your friendly AI assistant!**\n\nI'm here to help you with anything you need - from answering questions and having casual conversations to generating code and solving problems. What would you like to do today?`,
        userId: user.uid,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  }, [showIntro, user, messages.length]);

  useEffect(() => {
    if (user) {
      const fetchUserSettings = async () => {
        const userDoc = await getDoc(doc(firestore, `users/${user.uid}`));
        if (userDoc.exists()) {
          setUserSettings(userDoc.data().settings || defaultSettings);
        } else {
          await setDoc(doc(firestore, `users/${user.uid}`), {
            settings: defaultSettings,
          });
        }
      };
      fetchUserSettings();
    }
  }, [user]);

  useEffect(() => {
    const theme =
      userSettings.theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : userSettings.theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [userSettings.theme]);

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editContent.trim()) {
      setMessages((prev) =>
        prev.map((msg) =>
          (msg.timestamp || 0).toString() === editingMessageId
            ? { ...msg, content: editContent.trim() }
            : msg
        )
      );
      setEditingMessageId(null);
      setEditContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleModeSelect = async (
    isCodeGenerator: boolean,
    modeName: string,
    modeData?: ModeData
  ) => {
    setIsCodeGenerator(isCodeGenerator);
    setCurrentMode(modeName);
    setCurrentModeData(modeData || null);

    // Replace welcome message with confirmation
    const confirmationMessage: Message = {
      role: "assistant",
      content: `✅ **${modeName} mode activated!**\n\n${
        isCodeGenerator
          ? "🚀 **Elite Code Generator Mode Enabled**\n\nI'm now operating as the most advanced code generator available. I can create:\n• Production-ready applications\n• Complex algorithms and data structures\n• Full-stack solutions\n• Enterprise-grade code with best practices\n\nJust describe what you need - from simple scripts to large-scale systems!"
          : "💬 **Normal Chat Mode Enabled**\n\nLet's have a friendly conversation! I'm here to help with:\n• Answering questions\n• Providing explanations\n• Having casual discussions\n• Offering advice and insights\n\nWhat's on your mind, bro?"
      }`,
      userId: user!.uid,
      timestamp: Date.now(),
    };

    setMessages([confirmationMessage]);

    // Generate a second dynamic message
    setIsLoading(true);
    try {
      const dynamicPrompt = isCodeGenerator
        ? "Generate a short, enthusiastic welcome message for code generator mode. Make it different each time and highlight what makes this code generator special. Keep it under 100 words."
        : "Generate a short, friendly welcome message for chat mode. Make it different each time and show personality. Keep it under 100 words.";

      const dynamicMessage = await fetchAIResponse(
        [confirmationMessage],
        {
          role: "user",
          content: dynamicPrompt,
          userId: user!.uid,
          timestamp: Date.now(),
        },
        API_KEY,
        isCodeGenerator,
        user?.displayName || user?.email?.split("@")[0],
        modeData
      );

      const secondMessage: Message = {
        role: "assistant",
        content: dynamicMessage,
        userId: user!.uid,
        timestamp: Date.now(),
      };

      setMessages([confirmationMessage, secondMessage]);
    } catch (error) {
      console.error("Error generating dynamic message:", error);
      // Fallback message if AI fails
      const fallbackMessage: Message = {
        role: "assistant",
        content: isCodeGenerator
          ? "Ready to generate some amazing code! What would you like me to create for you?"
          : "Hey there! I'm excited to chat with you. What's the first thing you'd like to talk about?",
        userId: user!.uid,
        timestamp: Date.now(),
      };
      setMessages([confirmationMessage, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveToFirebase = async (message: Message) => {
    if (!user) return;

    try {
      const chatRef = ref(db, `chats/${user.uid}`);
      const newChatRef = push(chatRef);
      await set(newChatRef, {
        ...message,
        timestamp: Date.now(),
      });

      await addDoc(collection(firestore, `users/${user.uid}/history`), {
        ...message,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (
      messages.length === 1 &&
      messages[0].content.includes("Hey there! I'm Bro")
    ) {
      // Mode not selected yet
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      userId: user.uid,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(false);

    await saveToFirebase(userMessage);

    try {
      const aiResponse = await fetchAIResponse(
        messages,
        userMessage,
        API_KEY,
        isCodeGenerator,
        user?.displayName || user?.email?.split("@")[0],
        currentModeData || undefined
      );

      // Check for mode switch command in AI response
      const modeSwitchMatch = aiResponse.match(/\[MODE_SWITCH:(\w+)\]/i);
      let finalResponse = aiResponse;

      if (modeSwitchMatch) {
        const newModeName = modeSwitchMatch[1].toLowerCase();
        // Map mode names to our internal mode identifiers
        const modeMapping: {
          [key: string]: {
            isCodeGenerator: boolean;
            displayName: string;
            data?: ModeData;
          };
        } = {
          casual: {
            isCodeGenerator: false,
            displayName: "Casual Chat",
            data: {
              prompt: "casual",
              features: [
                "Natural conversations",
                "General questions",
                "Friendly advice",
              ],
              description: "Friendly conversations and general assistance",
            },
          },
          "elite-code": {
            isCodeGenerator: true,
            displayName: "Elite Code Generator",
            data: {
              prompt: "elite-code",
              features: [
                "Production-ready code",
                "Best practices",
                "Multiple languages",
              ],
              description: "Advanced code generation with best practices",
            },
          },
          creative: {
            isCodeGenerator: false,
            displayName: "Creative Writing",
            data: {
              prompt: "creative",
              features: [
                "Stories & narratives",
                "Poetry generation",
                "Creative writing",
              ],
              description: "Stories, poems, and creative content",
            },
          },
          "math-science": {
            isCodeGenerator: false,
            displayName: "Math & Science",
            data: {
              prompt: "math-science",
              features: [
                "Problem solving",
                "Scientific explanations",
                "Calculations",
              ],
              description: "Mathematical problems and scientific explanations",
            },
          },
          "problem-solver": {
            isCodeGenerator: false,
            displayName: "Problem Solver",
            data: {
              prompt: "problem-solver",
              features: [
                "Strategic analysis",
                "Complex problems",
                "Decision making",
              ],
              description: "Strategic thinking and complex problem resolution",
            },
          },
          researcher: {
            isCodeGenerator: false,
            displayName: "Research Assistant",
            data: {
              prompt: "researcher",
              features: [
                "Research summaries",
                "Academic writing",
                "Data synthesis",
              ],
              description: "In-depth research and academic support",
            },
          },
          speed: {
            isCodeGenerator: false,
            displayName: "Speed Mode",
            data: {
              prompt: "speed",
              features: ["Lightning fast", "Quick solutions", "Direct answers"],
              description: "Fast responses with quick solutions",
            },
          },
          visionary: {
            isCodeGenerator: false,
            displayName: "Visionary AI",
            data: {
              prompt: "visionary",
              features: [
                "Innovative ideas",
                "Future trends",
                "Creative solutions",
              ],
              description: "Innovative ideas and future-thinking",
            },
          },
          mentor: {
            isCodeGenerator: false,
            displayName: "AI Mentor",
            data: {
              prompt: "mentor",
              features: ["Skill development", "Learning paths", "Code reviews"],
              description: "Learning and skill development guidance",
            },
          },
        };

        const modeInfo = modeMapping[newModeName];
        if (modeInfo) {
          setIsCodeGenerator(modeInfo.isCodeGenerator);
          setCurrentMode(modeInfo.displayName);
          setCurrentModeData(modeInfo.data || null);

          // Show a toast notification for mode change
          toast.success(`🔄 Switched to ${modeInfo.displayName} mode!`, {
            duration: 3000,
          });
        }

        // Remove the mode switch command from the displayed response
        finalResponse = aiResponse.replace(/\[MODE_SWITCH:\w+\]/gi, "").trim();
      }

      // Clean and format the response
      let formattedResponse = finalResponse.trim();

      // Remove any remaining mode switch commands (double check)
      formattedResponse = formattedResponse
        .replace(/\[MODE_SWITCH:\w+\]/gi, "")
        .trim();

      // Clean up multiple spaces and newlines
      formattedResponse = formattedResponse.replace(/\n{3,}/g, "\n\n");
      formattedResponse = formattedResponse.replace(/ {2,}/g, " ");

      const assistantMessage: Message = {
        role: "assistant",
        content: formattedResponse,
        userId: user.uid,
        timestamp: Date.now(),
      };

      if (userSettings.soundEnabled) {
        new Audio();
      }

      setMessages((prev) => [...prev, assistantMessage]);
      await saveToFirebase(assistantMessage);
    } catch (error) {
      toast.error("Oops! Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry bro, I encountered an error. Mind trying again in a moment?",
          userId: user.uid,
          timestamp: Date.now(),
        },
      ]);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <IntroAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
            Ask Bro
          </h1>
          {currentMode !== "Not Selected" && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 shadow-sm border cursor-pointer hover:opacity-80 transition-opacity ${
                isCodeGenerator
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                  : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
              }`}
              title={`Currently in ${currentMode} mode - Click to change`}
              onClick={() => {
                // Reset to welcome message to allow mode re-selection
                const userName =
                  user?.displayName || user?.email?.split("@")[0];
                const welcomeMessage: Message = {
                  role: "assistant",
                  content: `👋 **Hey there${
                    userName ? ` ${userName}` : ""
                  }! I'm Bro, your friendly AI assistant!**\n\nI'm here to help you with anything you need - from answering questions and having casual conversations to generating code and solving problems. What would you like to do today?`,
                  userId: user!.uid,
                  timestamp: Date.now(),
                };
                setMessages([welcomeMessage]);
                setCurrentMode("Not Selected");
                setIsCodeGenerator(false);
              }}
            >
              {isCodeGenerator ? (
                <Code size={14} />
              ) : (
                <MessageCircle size={14} />
              )}
              {currentMode}
              <RotateCcw size={12} className="ml-1" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <UserProfile
              user={user}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
          <ThemeToggle
            theme={userSettings.theme}
            onToggle={() => {
              const newTheme =
                userSettings.theme === "light" ? "dark" : "light";
              setUserSettings({ ...userSettings, theme: newTheme });
            }}
          />
        </div>
      </header>

      <main
        className={`flex-1 overflow-y-auto py-6 ${
          userSettings.messageSpacing === "compact"
            ? "space-y-3"
            : userSettings.messageSpacing === "comfortable"
            ? "space-y-6"
            : "space-y-8"
        }`}
      >
        <div
          className={`w-full px-4 ${
            userSettings.fontSize === "small"
              ? "text-sm"
              : userSettings.fontSize === "large"
              ? "text-lg"
              : "text-base"
          }`}
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              showModeSelector={
                index === 0 &&
                messages.length === 1 &&
                message.role === "assistant" &&
                message.content.includes("Hey there") &&
                message.content.includes("I'm Bro")
              }
              onSelectMode={
                index === 0 &&
                messages.length === 1 &&
                message.role === "assistant"
                  ? handleModeSelect
                  : undefined
              }
              isWelcome={
                index === 0 &&
                messages.length === 1 &&
                message.role === "assistant" &&
                message.content.includes("Hey there") &&
                message.content.includes("I'm Bro")
              }
              onEdit={handleEditMessage}
              userAvatar={user?.photoURL || undefined}
              userName={
                user?.displayName || user?.email?.split("@")[0] || undefined
              }
            />
          ))}
          {isLoading && <LoadingAnimation error={error} />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
        {editingMessageId && (
          <div className="w-full px-4 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Edit3 size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Edit Message
              </span>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={3}
              placeholder="Edit your message..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full px-4 flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              user
                ? editingMessageId
                  ? "Use the edit box above..."
                  : messages.length === 1 &&
                    messages[0].content.includes("Hey there! I'm Bro")
                  ? "Choose a mode above to start chatting..."
                  : "Type your message..."
                : "Sign in to start chatting..."
            }
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            disabled={
              !user ||
              isLoading ||
              !!editingMessageId ||
              (messages.length === 1 &&
                messages[0].content.includes("Hey there! I'm Bro"))
            }
          />
          <button
            type="submit"
            disabled={
              !user ||
              isLoading ||
              !!editingMessageId ||
              (messages.length === 1 &&
                messages[0].content.includes("Hey there! I'm Bro"))
            }
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Send size={20} />
            {isLoading ? "Thinking..." : "Send"}
          </button>
        </form>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {user && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={userSettings}
          onUpdateSettings={setUserSettings}
          userId={user.uid}
        />
      )}
    </div>
  );
}

export default App;
