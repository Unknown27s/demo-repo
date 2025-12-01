import type { Message } from '../types';
import { Volume2 } from 'lucide-react';
import { useApp } from '../contexts/useApp';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { speak, isSpeaking } = useApp();
  const isUser = message.role === 'user';

  const handleSpeak = () => {
    if (!isSpeaking) {
      speak(message.content);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🤖</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">AI Tutor</span>
          </div>
        )}
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        
        {message.correction && (
          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-xs">
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Correction:</p>
            <p className="text-yellow-700 dark:text-yellow-300">
              <span className="line-through">{message.correction.original}</span>
              {' → '}
              <span className="font-medium">{message.correction.corrected}</span>
            </p>
            <p className="text-yellow-600 dark:text-yellow-400 mt-1">{message.correction.explanation}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs opacity-60">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {!isUser && (
            <button
              onClick={handleSpeak}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Listen to message"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
