import { X } from 'lucide-react';
import { useApp } from '../contexts/useApp';
import { CONVERSATION_MODES } from '../utils/conversationModes';
import type { ConversationMode } from '../types';

interface ModesSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModesSelector({ isOpen, onClose }: ModesSelectorProps) {
  const { settings, updateSettings } = useApp();

  const handleSelectMode = async (modeId: ConversationMode) => {
    await updateSettings({ conversationMode: modeId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative w-80 max-w-[85%] bg-white dark:bg-gray-800 h-full overflow-y-auto animate-slide-in-left">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Conversation Modes</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-4 space-y-3">
          {CONVERSATION_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleSelectMode(mode.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                settings.conversationMode === mode.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{mode.icon}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{mode.name}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
