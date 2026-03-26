'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { SqlItem } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Star, Trash2, Edit, Terminal, Play, Database, Check } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

export default function SqlPage() {
  const [items, setItems] = React.useState<SqlItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState<Partial<SqlItem>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const fetchItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{items: SqlItem[]}>(`/sql?search=${search}`);
      setItems(res.items);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(timer);
  }, [fetchItems, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.name || !currentItem.query) return;
    setIsSaving(true);
    try {
      if (currentItem.id) {
        await api.put(`/sql/${currentItem.id}`, currentItem);
      } else {
        await api.post(`/sql`, currentItem);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus query SQL ini?')) return;
    try {
      await api.delete(`/sql/${id}`);
      fetchItems();
    } catch (err) { console.error(err); }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.patch(`/sql/${id}/favorite`);
      fetchItems();
    } catch (err) { console.error(err); }
  };

  const openNew = () => {
    setCurrentItem({ name: '', query: '', description: '', result: '', category: 'Query' });
    setIsModalOpen(true);
  };

  const copyQuery = (id: string, q: string) => {
    navigator.clipboard.writeText(q);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <PageHeader title="SQL Workspace" description="Manage database queries, procedures, and data pipelines." actionText="New Query" onAction={openNew}>
        <div className="relative w-64 mr-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search queries..." className="pl-9 h-9" />
        </div>
      </PageHeader>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading queries...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <Database size={48} className="mb-4 text-slate-300" />
          <p>No SQL queries found.</p>
          <Button onClick={openNew} variant="outline" className="mt-4">Write your first query</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map(item => (
            <Card key={item.id} className="flex flex-col h-auto hover:border-blue-300 transition-colors">
              <CardHeader className="p-4 pb-3 border-b border-slate-100 flex-col space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal size={18} className="text-blue-500 shrink-0" />
                    <CardTitle className="text-base font-semibold leading-tight">{item.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1 -mt-1 -mr-1">
                    <button onClick={() => handleToggleFavorite(item.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400">
                      <Star size={16} fill={item.isFavorite ? 'currentColor' : 'none'} className={item.isFavorite ? 'text-amber-500' : ''} />
                    </button>
                    <button onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
                {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
                {item.category && <span className="inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 rounded">{item.category}</span>}
              </CardHeader>
              <CardContent className="p-0 border-b border-slate-100 relative group text-xs">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyQuery(item.id, item.query)} className="flex items-center space-x-1 rounded bg-white border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 shadow-sm">
                    {copiedId === item.id ? <Check size={12} className="text-emerald-500" /> : <Play size={12} />}
                    <span>{copiedId === item.id ? 'Copied' : 'Run / Copy'}</span>
                  </button>
                </div>
                <CodeMirror
                  value={item.query}
                  extensions={[sql()]}
                  editable={false}
                  theme="light"
                  basicSetup={{ lineNumbers: false, foldGutter: false }}
                  className="max-h-48 overflow-y-auto"
                />
              </CardContent>
              {item.result && (
                <div className="px-4 py-3 bg-slate-50/50 rounded-b-xl max-h-32 overflow-y-auto">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Expected Result / Output</p>
                  <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">{item.result}</pre>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem.id ? 'Edit Query' : 'New Query'} maxWidth="2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-sm font-medium">Query Name</label>
              <Input value={currentItem.name || ''} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} required placeholder="E.g. Get Active Users" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Input value={currentItem.category || ''} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} placeholder="E.g. Reporting" />
            </div>
          </div>
          
          <div className="space-y-1 border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <div className="bg-slate-50 px-3 py-1 border-b border-slate-200 text-xs font-mono font-medium text-slate-500">SQL Editor</div>
            <CodeMirror
              value={currentItem.query || ''}
              minHeight="150px"
              maxHeight="300px"
              theme="light"
              extensions={[sql()]}
              onChange={(val) => setCurrentItem({...currentItem, query: val})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                value={currentItem.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})}
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="What does this query do?"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Expected Result (Optional)</label>
              <textarea 
                value={currentItem.result || ''} onChange={e => setCurrentItem({...currentItem, result: e.target.value})}
                className="flex w-full rounded-md border border-slate-300 bg-slate-50 font-mono text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="JSON output, schema, etc."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Query'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
