import { useState } from 'react';
import { Plus, Trash2, Check, X, BookOpen } from 'lucide-react';
import { useApp } from '../contexts/useApp';
import type { VocabularyWord } from '../types';

interface VocabularyBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VocabularyBuilder({ isOpen, onClose }: VocabularyBuilderProps) {
  const { vocabulary, addVocabulary, removeVocabulary } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newExample, setNewExample] = useState('');

  const handleAddWord = async () => {
    if (newWord.trim() && newDefinition.trim()) {
      const word: VocabularyWord = {
        word: newWord.trim(),
        definition: newDefinition.trim(),
        example: newExample.trim(),
        dateAdded: Date.now(),
        timesReviewed: 0,
        mastered: false,
      };
      await addVocabulary(word);
      setNewWord('');
      setNewDefinition('');
      setNewExample('');
      setIsAdding(false);
    }
  };

  const handleRemoveWord = async (word: string) => {
    if (window.confirm(`Remove "${word}" from vocabulary?`)) {
      await removeVocabulary(word);
    }
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
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Vocabulary Builder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Add new word form */}
          {isAdding ? (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Word"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                placeholder="Definition"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                placeholder="Example sentence (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddWord}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Check className="w-4 h-4" />
                  Add
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-4"
            >
              <Plus className="w-5 h-5" />
              Add New Word
            </button>
          )}

          {/* Vocabulary list */}
          {vocabulary.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No words yet!</p>
              <p className="text-sm">Start building your vocabulary.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vocabulary.map((word) => (
                <div
                  key={word.word}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {word.word}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {word.definition}
                      </p>
                      {word.example && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 italic mt-1">
                          "{word.example}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveWord(word.word)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
