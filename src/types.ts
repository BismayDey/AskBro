export interface Message {
  role: "user" | "assistant";
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

export type Theme = "light" | "dark" | "system";

export interface UserSettings {
  theme: Theme;
  fontSize: "small" | "medium" | "large";
  messageSpacing: "compact" | "comfortable" | "spacious";
  soundEnabled: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  settings?: UserSettings;
}
