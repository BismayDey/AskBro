import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Message, ChatResponse, Theme, UserSettings } from './types';
import { ChatMessage } from './components/ChatMessage';
import { IntroAnimation } from './components/IntroAnimation';
import { ThemeToggle } from './components/ThemeToggle';
import { LoadingAnimation } from './components/LoadingAnimation';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { SettingsModal } from './components/SettingsModal';
import { auth, db, firestore } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ref, set, push } from 'firebase/database';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { fetchAIResponse } from './utils/ai';

const API_KEY = import.meta.env.VITE_API_KEY;

const defaultSettings: UserSettings = {
  theme: 'system',
  fontSize: 'medium',
  messageSpacing: 'comfortable',
  soundEnabled: true,
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
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
      userSettings.theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : userSettings.theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [userSettings.theme]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      console.error('Error saving message:', error);
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
      role: 'user',
      content: input,
      userId: user.uid,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(false);

    await saveToFirebase(userMessage);

    try {
      const aiResponse = await fetchAIResponse(messages, userMessage, API_KEY);

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        userId: user.uid,
        timestamp: Date.now(),
      };

      if (userSettings.soundEnabled) {
        new Audio();
      }

      setMessages((prev) => [...prev, assistantMessage]);
      await saveToFirebase(assistantMessage);
    } catch (error) {
      toast.error('Oops! Something went wrong. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Sorry bro, I encountered an error. Mind trying again in a moment?',
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
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <IntroAnimation />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col'>
      <header className='bg-white dark:bg-gray-800 shadow-sm py-4 px-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent'>
          Ask Bro
        </h1>
        <div className='flex items-center gap-4'>
          {user ? (
            <UserProfile
              user={user}
              onOpenSettings={() => setShowSettingsModal(true)}
            />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors'>
              Sign In
            </button>
          )}
          <ThemeToggle
            theme={userSettings.theme}
            onToggle={() => {
              const newTheme =
                userSettings.theme === 'light' ? 'dark' : 'light';
              setUserSettings({ ...userSettings, theme: newTheme });
            }}
          />
        </div>
      </header>

      <main
        className={`flex-1 overflow-y-auto p-4 ${
          userSettings.messageSpacing === 'compact'
            ? 'space-y-2'
            : userSettings.messageSpacing === 'comfortable'
            ? 'space-y-4'
            : 'space-y-6'
        }`}>
        <div
          className={`max-w-3xl mx-auto ${
            userSettings.fontSize === 'small'
              ? 'text-sm'
              : userSettings.fontSize === 'large'
              ? 'text-lg'
              : 'text-base'
          }`}>
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && <LoadingAnimation error={error} />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className='bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4'>
        <form onSubmit={handleSubmit} className='max-w-3xl mx-auto flex gap-4'>
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              user ? 'Type your message...' : 'Sign in to start chatting...'
            }
            className='flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors'
            disabled={!user || isLoading}
          />
          <button
            type='submit'
            disabled={!user || isLoading}
            className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors'>
            <Send size={20} />
            {isLoading ? 'Thinking...' : 'Send'}
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
