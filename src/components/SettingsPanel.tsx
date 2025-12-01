import { useState, useEffect } from 'react';
import { X, Volume2 } from 'lucide-react';
import { useApp } from '../contexts/useApp';
import { getSpeechService } from '../services/speechService';
import { setGroqApiKey, hasGroqApiKey } from '../services/groqService';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useApp();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(hasGroqApiKey());

  useEffect(() => {
    const loadVoices = async () => {
      const speechService = getSpeechService();
      const availableVoices = await speechService.loadVoices();
      setVoices(availableVoices);
    };
    loadVoices();
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setGroqApiKey(apiKey.trim());
      setApiKeySaved(true);
      setApiKey('');
      // Reload to apply changes
      window.location.reload();
    }
  };

  const handleTestVoice = () => {
    const speechService = getSpeechService();
    speechService.setSpeechRate(settings.speechRate);
    speechService.setSpeechPitch(settings.voicePitch);
    if (settings.selectedVoice) {
      speechService.setVoice(settings.selectedVoice);
    }
    speechService.speak("Hello! I'm your English speaking partner. Let's practice together!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* API Key Section */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Groq API Key</h3>
            {apiKeySaved ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✓ API key is configured
              </p>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Groq API key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save API Key
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get your free API key from{' '}
                  <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400">
                    console.groq.com
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Theme */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Theme</h3>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateSettings({ theme: t })}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    settings.theme === t
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Settings */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Voice Settings</h3>
            
            {/* Voice Selection */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Voice</label>
              <select
                value={settings.selectedVoice}
                onChange={(e) => updateSettings({ selectedVoice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Default</option>
                {voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Speech Rate */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Speech Rate: {settings.speechRate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.speechRate}
                onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Speech Pitch */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Pitch: {settings.voicePitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voicePitch}
                onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Test Voice */}
            <button
              onClick={handleTestVoice}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Volume2 className="w-4 h-4" />
              Test Voice
            </button>
          </div>

          {/* Auto-speak */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => updateSettings({ autoSpeak: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-900 dark:text-white">Auto-speak AI responses</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
