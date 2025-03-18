import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Message, ChatResponse, Theme, UserSettings } from "./types";
import { ChatMessage } from "./components/ChatMessage";
import { IntroAnimation } from "./components/IntroAnimation";
import { ThemeToggle } from "./components/ThemeToggle";
import { LoadingAnimation } from "./components/LoadingAnimation";
import { AuthModal } from "./components/AuthModal";
import { UserProfile } from "./components/UserProfile";
import { SettingsModal } from "./components/SettingsModal";
import { auth, db, firestore } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, set, push } from "firebase/database";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      const response = await fetch(
        "https://api.openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Ask Bro",
          },
          body: JSON.stringify({
            model: "oogle/gemma-3-1b-it:free",
            messages: [
              {
                role: "system",
                content:
                  "You are Bro, a friendly and knowledgeable AI assistant. You speak in a casual, bro-like manner while maintaining professionalism and providing accurate, helpful information. You use phrases like 'Hey bro!', 'Got you covered, bro!', but you're also articulate and thorough in your explanations. You're like a smart friend who's always ready to help.",
              },
              ...messages,
              userMessage,
            ].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data: ChatResponse = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
        userId: user.uid,
        timestamp: Date.now(),
      };

      if (userSettings.soundEnabled) {
        new Audio(
          "data:audio/wav;base64,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"
        );
      }

      setMessages((prev) => [...prev, assistantMessage]);
      await saveToFirebase(assistantMessage);
    } catch (error) {
      console.error("Error:", error);
      setError(true);
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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
          Ask Bro
        </h1>
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
        className={`flex-1 overflow-y-auto p-4 ${
          userSettings.messageSpacing === "compact"
            ? "space-y-2"
            : userSettings.messageSpacing === "comfortable"
            ? "space-y-4"
            : "space-y-6"
        }`}
      >
        <div
          className={`max-w-3xl mx-auto ${
            userSettings.fontSize === "small"
              ? "text-sm"
              : userSettings.fontSize === "large"
              ? "text-lg"
              : "text-base"
          }`}
        >
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && <LoadingAnimation error={error} />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              user ? "Type your message..." : "Sign in to start chatting..."
            }
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            disabled={!user || isLoading}
          />
          <button
            type="submit"
            disabled={!user || isLoading}
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
