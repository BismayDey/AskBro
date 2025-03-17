import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Message, ChatResponse, Theme } from "./types";
import { ChatMessage } from "./components/ChatMessage";
import { IntroAnimation } from "./components/IntroAnimation";
import { ThemeToggle } from "./components/ThemeToggle";
import { LoadingAnimation } from "./components/LoadingAnimation";
import { AuthModal } from "./components/AuthModal";
import { UserProfile } from "./components/UserProfile";
import { auth, db, firestore } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, set, push } from "firebase/database";
import { collection, addDoc } from "firebase/firestore";
import toast from "react-hot-toast";

// Use your API key directly (for testing purposes only)
const API_KEY =
  "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";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [error, setError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user] = useAuthState(auth);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveToFirebase = async (message: Message) => {
    if (!user) return;

    try {
      // Save to Realtime Database
      const chatRef = ref(db, `chats/${user.uid}`);
      const newChatRef = push(chatRef);
      await set(newChatRef, {
        ...message,
        timestamp: Date.now(),
      });

      // Save to Firestore
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
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
            "HTTP-Referer": window.location.origin, // Add referer header
            "X-Title": "Ask Bro", // Add title header
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1-zero", // Keep your model
            messages: [
              {
                role: "system",
                content:
                  "You are Bro, a friendly and knowledgeable AI assistant. You speak in a casual, bro-like manner while maintaining professionalism and providing accurate, helpful information. You use phrases like 'Hey bro!', 'Got you covered, bro!', but you're also articulate and thorough in your explanations. You're like a smart friend who's always ready to help.",
              },
              ...messages,
              userMessage,
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
        userId: user.uid,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await saveToFirebase(assistantMessage);
    } catch (error) {
      console.error("Fetch error:", error);
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
            <UserProfile user={user} />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
          <ThemeToggle
            theme={theme}
            onToggle={() => setTheme(theme === "light" ? "dark" : "light")}
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
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
    </div>
  );
}

export default App;
