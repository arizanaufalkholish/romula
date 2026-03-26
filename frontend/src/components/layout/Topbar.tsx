'use client';

import * as React from 'react';
import { Search, Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  const { user, setUser, theme, toggleTheme } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('romula_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ROMULA (Press Ctrl+K or Click)"
            onFocus={() => router.push('/search')}
            readOnly
            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-colors hover:border-blue-400 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="text-slate-500 hover:text-blue-600 transition-colors" title="Toggle Dark Mode">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="relative text-slate-500 hover:text-slate-700">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <span className="text-sm font-medium text-slate-700">{user?.name || 'Loading...'}</span>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}
