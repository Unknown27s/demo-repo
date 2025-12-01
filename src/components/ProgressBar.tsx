import { Flame, Clock, BookOpen, Trophy } from 'lucide-react';
import { useApp } from '../contexts/useApp';

export function ProgressBar() {
  const { progress } = useApp();

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3">
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-300" />
          <span className="font-medium">{progress.dailyStreak}</span>
          <span className="text-xs opacity-80">day streak</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-200" />
          <span className="font-medium">{progress.minutesSpoken}</span>
          <span className="text-xs opacity-80">min</span>
        </div>
        
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-green-300" />
          <span className="font-medium">{progress.wordsLearned.length}</span>
          <span className="text-xs opacity-80">words</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-300" />
          <span className="font-medium">{progress.totalSessions}</span>
          <span className="text-xs opacity-80">sessions</span>
        </div>
      </div>
    </div>
  );
}
