'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, Database, Users, 
  Terminal, Code2, FileText, Newspaper, 
  Wallet, PieChart, Settings, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';

const ROUTES = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Library', path: '/library', icon: BookOpen },
  { name: 'Tables', path: '/tables', icon: Database },
  { name: 'People', path: '/people', icon: Users },
  { name: 'SQL Workspace', path: '/sql', icon: Terminal },
  { name: 'Code Lab', path: '/code', icon: Code2 },
  { name: 'Notes', path: '/notes', icon: FileText },
  { name: 'News', path: '/news', icon: Newspaper },
  { name: 'Finance', path: '/finance', icon: Wallet },
  { name: 'Analytics', path: '/analytics', icon: PieChart },
  { name: 'Search', path: '/search', icon: Search },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, user } = useStore();

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const userName = user?.name || 'User';

  return (
    <aside 
      className={cn(
        'relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-10',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
        {sidebarOpen ? (
          <span className="text-xl font-bold tracking-tight text-slate-900">ROMULA</span>
        ) : (
          <span className="text-xl font-bold tracking-tight text-blue-600 mx-auto">R</span>
        )}
      </div>
      
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-600 z-20"
      >
        {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ROUTES.map((route) => {
          const isActive = pathname.startsWith(route.path);
          const Icon = route.icon;
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                !sidebarOpen && 'justify-center px-0'
              )}
              title={!sidebarOpen ? route.name : undefined}
            >
              <Icon 
                size={20} 
                className={cn('shrink-0', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600', sidebarOpen && 'mr-3')} 
              />
              {sidebarOpen && <span>{route.name}</span>}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-slate-200 p-4">
        <div className={cn('flex items-center', !sidebarOpen && 'justify-center')}>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
            {userInitial}
          </div>
          {sidebarOpen && (
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
