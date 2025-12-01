import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Message, UserProgress, AppSettings, ConversationMode, VocabularyWord } from '../types';
import { AppContext } from './AppContextTypes';
import type { AppContextType } from './AppContextTypes';
import * as db from '../services/database';
import { getGroqService, hasGroqApiKey } from '../services/groqService';
import { getSpeechService } from '../services/speechService';

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    dailyStreak: 0,
    lastActiveDate: '',
    minutesSpoken: 0,
    wordsLearned: [],
    totalSessions: 0,
    todayMinutes: 0,
  });
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    speechRate: 1,
    voicePitch: 1,
    selectedVoice: '',
    autoSpeak: true,
    conversationMode: 'daily-life',
  });
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  
  // UI State
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hasApiKey, setHasApiKey] = useState(false);
  
  // Session timing
  const [sessionStart] = useState<number>(Date.now());

  // Initialize data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedMessages, loadedProgress, loadedSettings, loadedVocabulary] = await Promise.all([
          db.getAllMessages(),
          db.getProgress(),
          db.getSettings(),
          db.getAllVocabulary(),
        ]);
        
        setMessages(loadedMessages);
        setProgress(loadedProgress);
        setSettings(loadedSettings);
        setVocabulary(loadedVocabulary);
        setHasApiKey(hasGroqApiKey());
        
        // Update daily streak on app load
        const updatedProgress = await db.updateDailyStreak();
        setProgress(updatedProgress);
        
        // Apply theme
        applyTheme(loadedSettings.theme);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, []);

  // Apply theme based on settings
  const applyTheme = (themeSetting: 'light' | 'dark' | 'system') => {
    let effectiveTheme: 'light' | 'dark';
    
    if (themeSetting === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = themeSetting;
    }
    
    setTheme(effectiveTheme);
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  };

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  // Add message
  const addMessage = useCallback(async (role: 'user' | 'assistant', content: string): Promise<Message> => {
    const message: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now(),
    };
    
    await db.saveMessage(message);
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  // Clear chat
  const clearChat = useCallback(async () => {
    await db.clearMessages();
    setMessages([]);
  }, []);

  // Text-to-speech
  const speak = useCallback((text: string) => {
    const speechService = getSpeechService();
    speechService.setSpeechRate(settings.speechRate);
    speechService.setSpeechPitch(settings.voicePitch);
    if (settings.selectedVoice) {
      speechService.setVoice(settings.selectedVoice);
    }
    
    setIsSpeaking(true);
    speechService.speak(text, () => {
      setIsSpeaking(false);
    });
  }, [settings.speechRate, settings.voicePitch, settings.selectedVoice]);

  const stopSpeaking = useCallback(() => {
    const speechService = getSpeechService();
    speechService.stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // Send message to AI
  const sendToAI = useCallback(async (userMessage: string) => {
    setAiError(null);
    setIsAILoading(true);
    
    try {
      await addMessage('user', userMessage);
      
      const groqService = getGroqService();
      const response = await groqService.sendMessage(
        userMessage,
        messages,
        settings.conversationMode as ConversationMode
      );
      
      await addMessage('assistant', response.message);
      
      // Auto-speak response if enabled
      if (settings.autoSpeak) {
        speak(response.message);
      }
      
      // Update progress
      const sessionMinutes = Math.floor((Date.now() - sessionStart) / 60000);
      if (sessionMinutes > 0) {
        const updatedProgress = await db.addSpokenMinutes(1);
        setProgress(updatedProgress);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      setAiError(errorMessage);
      throw error;
    } finally {
      setIsAILoading(false);
    }
  }, [messages, settings.conversationMode, settings.autoSpeak, addMessage, sessionStart, speak]);

  // Speech recognition
  const startListening = useCallback(() => {
    setSpeechError(null);
    const speechService = getSpeechService();
    
    speechService.startListening(
      async (text) => {
        // On successful recognition, send to AI
        if (text.trim()) {
          await sendToAI(text);
        }
      },
      (error) => {
        setSpeechError(error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
    
    setIsListening(true);
  }, [sendToAI]);

  const stopListening = useCallback(() => {
    const speechService = getSpeechService();
    speechService.stopListening();
    setIsListening(false);
  }, []);

  // Update progress
  const updateProgress = useCallback(async () => {
    const updatedProgress = await db.getProgress();
    setProgress(updatedProgress);
  }, []);

  // Update settings
  const updateSettingsCallback = useCallback(async (newSettings: Partial<AppSettings>) => {
    const updated = await db.updateSettings(newSettings);
    setSettings(updated);
    
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateSettingsCallback({ theme: newTheme });
  }, [theme, updateSettingsCallback]);

  // Vocabulary management
  const addVocabulary = useCallback(async (word: VocabularyWord) => {
    await db.addVocabularyWord(word);
    setVocabulary(prev => [...prev, word]);
    await db.addLearnedWord(word.word);
    setProgress(prev => ({
      ...prev,
      wordsLearned: [...prev.wordsLearned, word.word],
    }));
  }, []);

  const removeVocabulary = useCallback(async (word: string) => {
    await db.deleteVocabularyWord(word);
    setVocabulary(prev => prev.filter(v => v.word !== word));
  }, []);

  const value: AppContextType = {
    messages,
    addMessage,
    clearChat,
    sendToAI,
    isAILoading,
    aiError,
    hasApiKey,
    isListening,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    speechError,
    progress,
    updateProgress,
    settings,
    updateSettings: updateSettingsCallback,
    theme,
    toggleTheme,
    vocabulary,
    addVocabulary,
    removeVocabulary,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
