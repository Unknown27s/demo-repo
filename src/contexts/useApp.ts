import { useContext } from 'react';
import { AppContext } from './AppContextTypes';
import type { AppContextType } from './AppContextTypes';

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
