import { createContext } from 'react';
import type { Message, UserProgress, AppSettings, VocabularyWord } from '../types';

export interface AppContextType {
  // Messages
  messages: Message[];
  addMessage: (role: 'user' | 'assistant', content: string) => Promise<Message>;
  clearChat: () => Promise<void>;
  
  // AI
  sendToAI: (userMessage: string) => Promise<void>;
  isAILoading: boolean;
  aiError: string | null;
  hasApiKey: boolean;
  
  // Speech
  isListening: boolean;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  speechError: string | null;
  
  // Progress
  progress: UserProgress;
  updateProgress: () => Promise<void>;
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Vocabulary
  vocabulary: VocabularyWord[];
  addVocabulary: (word: VocabularyWord) => Promise<void>;
  removeVocabulary: (word: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
