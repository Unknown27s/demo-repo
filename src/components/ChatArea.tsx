import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { VoiceButton } from './VoiceButton';
import { useApp } from '../contexts/useApp';
import { MessageCircle } from 'lucide-react';

export function ChatArea() {
  const { messages, isAILoading, aiError } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAILoading]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Start a Conversation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
              Tap the microphone button below and start speaking in English. 
              I'll help you practice and improve!
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isAILoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {aiError && (
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm text-center">
          {aiError}
        </div>
      )}

      {/* Voice input area */}
      <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <VoiceButton />
      </div>
    </div>
  );
}
