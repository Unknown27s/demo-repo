// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  correction?: GrammarCorrection;
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

// Conversation mode types
export type ConversationMode = 
  | 'daily-life'
  | 'job-interview'
  | 'travel'
  | 'customer-service'
  | 'accent-practice';

export interface ConversationModeConfig {
  id: ConversationMode;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

// Progress tracking types
export interface UserProgress {
  dailyStreak: number;
  lastActiveDate: string;
  minutesSpoken: number;
  wordsLearned: string[];
  totalSessions: number;
  todayMinutes: number;
}

// Vocabulary types
export interface VocabularyWord {
  word: string;
  definition: string;
  example: string;
  dateAdded: number;
  timesReviewed: number;
  mastered: boolean;
}

// Settings types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  speechRate: number;
  voicePitch: number;
  selectedVoice: string;
  autoSpeak: boolean;
  conversationMode: ConversationMode;
}

// AI Response types
export interface AIResponse {
  message: string;
  correction?: GrammarCorrection;
  vocabularySuggestions?: string[];
}
