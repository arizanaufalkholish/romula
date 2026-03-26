'use client';

import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useStore } from '@/store';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, initTheme } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(true);

  // Initialize theme from localStorage on mount
  React.useEffect(() => {
    initTheme();
  }, [initTheme]);

  React.useEffect(() => {
    // Skip auth check for login/register pages
    if (pathname === '/login' || pathname === '/register') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('romula_token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!user) {
      api.get<any>('/auth/me')
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('romula_token');
          router.push('/login');
        });
    } else {
      setLoading(false);
    }
  }, [pathname, user, setUser, router]);

  // Don't wrap login/register in sidebar layout
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
