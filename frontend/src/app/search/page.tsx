'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Search as SearchIcon, FileText, Code2, Users, Terminal, Database, Newspaper, Wallet, Folder } from 'lucide-react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  createdAt: string;
}

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = React.useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get<{ results: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}`);
      setResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const getModuleConfig = (type: string) => {
    switch(type) {
      case 'notes': return { icon: <FileText size={18} className="text-indigo-600"/>, color: 'bg-indigo-100', path: '/notes', label: 'Notes' };
      case 'code': return { icon: <Code2 size={18} className="text-emerald-600"/>, color: 'bg-emerald-100', path: '/code', label: 'Code' };
      case 'sql': return { icon: <Terminal size={18} className="text-rose-600"/>, color: 'bg-rose-100', path: '/sql', label: 'SQL' };
      case 'tables': return { icon: <Database size={18} className="text-amber-600"/>, color: 'bg-amber-100', path: '/tables', label: 'Tables' };
      case 'people': return { icon: <Users size={18} className="text-blue-600"/>, color: 'bg-blue-100', path: '/people', label: 'People' };
      case 'news': return { icon: <Newspaper size={18} className="text-fuchsia-600"/>, color: 'bg-fuchsia-100', path: '/news', label: 'News' };
      case 'finance': return { icon: <Wallet size={18} className="text-sky-600"/>, color: 'bg-sky-100', path: '/finance', label: 'Finance' };
      case 'files': return { icon: <Folder size={18} className="text-cyan-600"/>, color: 'bg-cyan-100', path: '/library', label: 'Files' };
      default: return { icon: <SearchIcon size={18} className="text-slate-600"/>, color: 'bg-slate-100', path: '/dashboard', label: type };
    }
  };

  // Group flat results array by type
  const grouped = React.useMemo(() => {
    const map: Record<string, SearchResult[]> = {};
    results.forEach(r => {
      if (!map[r.type]) map[r.type] = [];
      map[r.type].push(r);
    });
    return Object.entries(map);
  }, [results]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <SearchIcon size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Global Search</h1>
        <p className="text-slate-500 mb-8 max-w-lg mx-auto">Find anything across all your ROMULA modules instantly.</p>
        
        <div className="relative max-w-2xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search your data..."
            className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-slate-200 bg-white text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
          )}
        </div>
      </div>

      {!loading && query.length >= 2 && (
        <div className="space-y-6">
          <p className="text-sm font-medium text-slate-500 px-2 pb-2 border-b border-slate-200">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>

          {grouped.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <SearchIcon size={40} className="mx-auto mb-3 opacity-50" />
              <p>No results found for your search.</p>
            </div>
          )}

          {grouped.map(([type, items]) => {
            const config = getModuleConfig(type);
            return (
              <div key={type} className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center space-x-2">
                  <span>{config.label}</span>
                  <span className="bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 text-[10px]">{items.length}</span>
                </h3>
                <div className="flex flex-col space-y-2">
                  {items.map((item) => (
                    <Link href={config.path} key={item.id} className="block group/item">
                      <Card className="hover:border-blue-300 transition-colors bg-white">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${config.color}`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-slate-900 truncate group-hover/item:text-blue-600">
                              {item.title || 'Untitled Item'}
                            </h4>
                            <p className="text-sm text-slate-500 truncate mt-0.5">
                              {item.subtitle || 'No additional details'} • {timeAgo(item.createdAt)}
                            </p>
                          </div>
                          <div className="shrink-0 text-slate-400 group-hover/item:text-blue-500 transition-colors">
                            <span className="opacity-0 group-hover/item:opacity-100 text-sm font-medium">View &rarr;</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
