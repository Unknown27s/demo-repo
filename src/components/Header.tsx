import { Moon, Sun, Settings, Trash2, Menu } from 'lucide-react';
import { useApp } from '../contexts/useApp';
import { getConversationMode } from '../utils/conversationModes';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenModes: () => void;
}

export function Header({ onOpenSettings, onOpenModes }: HeaderProps) {
  const { theme, toggleTheme, clearChat, settings } = useApp();
  const currentMode = getConversationMode(settings.conversationMode);

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      await clearChat();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenModes}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Select mode"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <div>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">SpeakEng</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>{currentMode.icon}</span>
            <span>{currentMode.name}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleClearChat}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Clear chat"
        >
          <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </header>
  );
}
