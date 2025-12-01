import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Message, UserProgress, VocabularyWord, AppSettings, ConversationMode } from '../types';

interface SpeakEngDB extends DBSchema {
  messages: {
    key: string;
    value: Message;
    indexes: { 'by-timestamp': number };
  };
  vocabulary: {
    key: string;
    value: VocabularyWord;
    indexes: { 'by-date': number };
  };
  progress: {
    key: string;
    value: UserProgress;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'speakeng-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<SpeakEngDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SpeakEngDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<SpeakEngDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('by-timestamp', 'timestamp');
      }

      // Vocabulary store
      if (!db.objectStoreNames.contains('vocabulary')) {
        const vocabStore = db.createObjectStore('vocabulary', { keyPath: 'word' });
        vocabStore.createIndex('by-date', 'dateAdded');
      }

      // Progress store
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress', { keyPath: 'id' });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// Message operations
export async function saveMessage(message: Message): Promise<void> {
  const db = await getDB();
  await db.put('messages', message);
}

export async function getAllMessages(): Promise<Message[]> {
  const db = await getDB();
  return db.getAllFromIndex('messages', 'by-timestamp');
}

export async function clearMessages(): Promise<void> {
  const db = await getDB();
  await db.clear('messages');
}

// Vocabulary operations
export async function addVocabularyWord(word: VocabularyWord): Promise<void> {
  const db = await getDB();
  await db.put('vocabulary', word);
}

export async function getAllVocabulary(): Promise<VocabularyWord[]> {
  const db = await getDB();
  return db.getAllFromIndex('vocabulary', 'by-date');
}

export async function updateVocabularyWord(word: VocabularyWord): Promise<void> {
  const db = await getDB();
  await db.put('vocabulary', word);
}

export async function deleteVocabularyWord(wordText: string): Promise<void> {
  const db = await getDB();
  await db.delete('vocabulary', wordText);
}

// Progress operations
const DEFAULT_PROGRESS: UserProgress = {
  dailyStreak: 0,
  lastActiveDate: '',
  minutesSpoken: 0,
  wordsLearned: [],
  totalSessions: 0,
  todayMinutes: 0,
};

export async function getProgress(): Promise<UserProgress> {
  const db = await getDB();
  const progress = await db.get('progress', 'user-progress');
  return progress || DEFAULT_PROGRESS;
}

export async function updateProgress(progress: Partial<UserProgress>): Promise<UserProgress> {
  const db = await getDB();
  const current = await getProgress();
  const updated = { ...current, ...progress };
  await db.put('progress', { ...updated, id: 'user-progress' } as UserProgress & { id: string });
  return updated;
}

export async function updateDailyStreak(): Promise<UserProgress> {
  const current = await getProgress();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = current.dailyStreak;
  let todayMinutes = current.todayMinutes;

  if (current.lastActiveDate === today) {
    // Already active today, no streak change
  } else if (current.lastActiveDate === yesterday) {
    // Consecutive day, increment streak
    newStreak = current.dailyStreak + 1;
    todayMinutes = 0;
  } else if (current.lastActiveDate !== today) {
    // Streak broken, reset to 1
    newStreak = 1;
    todayMinutes = 0;
  }

  return updateProgress({
    dailyStreak: newStreak,
    lastActiveDate: today,
    todayMinutes,
    totalSessions: current.totalSessions + 1,
  });
}

export async function addSpokenMinutes(minutes: number): Promise<UserProgress> {
  const current = await getProgress();
  return updateProgress({
    minutesSpoken: current.minutesSpoken + minutes,
    todayMinutes: current.todayMinutes + minutes,
  });
}

export async function addLearnedWord(word: string): Promise<UserProgress> {
  const current = await getProgress();
  if (!current.wordsLearned.includes(word)) {
    return updateProgress({
      wordsLearned: [...current.wordsLearned, word],
    });
  }
  return current;
}

// Settings operations
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  speechRate: 1,
  voicePitch: 1,
  selectedVoice: '',
  autoSpeak: true,
  conversationMode: 'daily-life' as ConversationMode,
};

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user-settings');
  return settings || DEFAULT_SETTINGS;
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDB();
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await db.put('settings', { ...updated, id: 'user-settings' } as AppSettings & { id: string });
  return updated;
}
