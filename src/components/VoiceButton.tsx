import { Mic, Square } from 'lucide-react';
import { useApp } from '../contexts/useApp';

export function VoiceButton() {
  const { isListening, startListening, stopListening, isSpeaking, speechError } = useApp();

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isSpeaking}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-indigo-600 hover:bg-indigo-700'
        } ${isSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? (
          <Square className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
        
        {/* Listening animation rings */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30"></span>
            <span className="absolute inset-[-4px] rounded-full border-2 border-red-400 animate-pulse"></span>
          </>
        )}
      </button>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {isListening ? 'Listening... Tap to stop' : isSpeaking ? 'AI is speaking...' : 'Tap to speak'}
      </p>
      
      {speechError && (
        <p className="text-xs text-red-500 text-center max-w-[200px]">{speechError}</p>
      )}
    </div>
  );
}
