import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../utils/types';

interface ThemeStore {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleTheme: () =>
        set((state) => {
          const newMode = state.mode === 'light' ? 'dark' : 'light';
          
          // Applique la classe au document
          if (newMode === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          return { mode: newMode };
        }),
      setTheme: (mode) =>
        set(() => {
          // Applique la classe au document
          if (mode === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          
          return { mode };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
