import { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { useApp } from './contexts/useApp';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { ChatArea } from './components/ChatArea';
import { ModesSelector } from './components/ModesSelector';
import { SettingsPanel } from './components/SettingsPanel';
import { VocabularyBuilder } from './components/VocabularyBuilder';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { hasGroqApiKey } from './services/groqService';
import { BookOpen } from 'lucide-react';
import './App.css';

function AppContent() {
  useApp();
  const [showModes, setShowModes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(hasGroqApiKey());

  if (!apiKeyConfigured) {
    return <ApiKeyPrompt onComplete={() => setApiKeyConfigured(true)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header 
        onOpenSettings={() => setShowSettings(true)}
        onOpenModes={() => setShowModes(true)}
      />
      <ProgressBar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatArea />
      </main>

      {/* Floating vocabulary button */}
      <button
        onClick={() => setShowVocabulary(true)}
        className="fixed bottom-28 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-40"
        aria-label="Open vocabulary"
      >
        <BookOpen className="w-5 h-5" />
      </button>

      {/* Modals */}
      <ModesSelector 
        isOpen={showModes} 
        onClose={() => setShowModes(false)} 
      />
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      <VocabularyBuilder 
        isOpen={showVocabulary} 
        onClose={() => setShowVocabulary(false)} 
      />

      {/* AdSense placeholder for PWA */}
      <div className="h-14 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs text-gray-400">
        <span>Ad Space - AdSense / AdMob</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
