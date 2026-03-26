import { create } from 'zustand';
import { User } from '@/lib/types';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('romula_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'light';
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),

  theme: 'light',
  toggleTheme: () => set((state) => {
    const next = state.theme === 'light' ? 'dark' : 'light';
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('romula_theme', next);
    }
    return { theme: next };
  }),
  initTheme: () => {
    const saved = getInitialTheme();
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
    set({ theme: saved });
  },
}));
