import { useState } from 'react';
import type { FormEvent } from 'react';
import { Key } from 'lucide-react';
import { setGroqApiKey } from '../services/groqService';

interface ApiKeyPromptProps {
  onComplete: () => void;
}

export function ApiKeyPrompt({ onComplete }: ApiKeyPromptProps) {
  const [apiKey, setApiKeyValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (apiKey.trim().length < 10) {
      setError('Please enter a valid API key');
      return;
    }
    setGroqApiKey(apiKey.trim());
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SpeakEng
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your AI English Speaking Partner
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            To use the AI conversation features, you'll need a free Groq API key.
            Get one at{' '}
            <a 
              href="https://console.groq.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              console.groq.com
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Groq API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKeyValue(e.target.value);
                setError('');
              }}
              placeholder="gsk_..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Your API key is stored locally on your device and never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
