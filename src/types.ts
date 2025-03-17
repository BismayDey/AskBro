export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  userId?: string;
}

export interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export type Theme = 'light' | 'dark';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}