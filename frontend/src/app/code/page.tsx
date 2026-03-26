'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { CodeSnippet } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Star, Trash2, Edit, Code2, Copy, Check } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';

export default function CodePage() {
  const [snippets, setSnippets] = React.useState<CodeSnippet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentSnippet, setCurrentSnippet] = React.useState<Partial<CodeSnippet>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const fetchSnippets = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{items: CodeSnippet[]}>(`/code?search=${search}`);
      setSnippets(res.items);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchSnippets(), 300);
    return () => clearTimeout(timer);
  }, [fetchSnippets, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSnippet.name || !currentSnippet.code) return;
    setIsSaving(true);
    try {
      if (currentSnippet.id) {
        await api.put(`/code/${currentSnippet.id}`, currentSnippet);
      } else {
        await api.post(`/code`, currentSnippet);
      }
      setIsModalOpen(false);
      fetchSnippets();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    try {
      await api.delete(`/code/${id}`);
      fetchSnippets();
    } catch (err) { console.error(err); }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.patch(`/code/${id}/favorite`);
      fetchSnippets();
    } catch (err) { console.error(err); }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openNew = () => {
    setCurrentSnippet({ name: '', code: '', language: 'javascript', description: '', category: 'General' });
    setIsModalOpen(true);
  };

  const getLanguageExtension = (lang: string) => {
    if (lang === 'python') return [python()];
    if (lang === 'sql') return [sql()];
    return [javascript({ jsx: true, typescript: true })];
  };

  return (
    <div>
      <PageHeader title="Code Lab" description="Store, share, and manage your code snippets." actionText="New Snippet" onAction={openNew}>
        <div className="relative w-64 mr-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search snippets..." className="pl-9 h-9" />
        </div>
      </PageHeader>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading snippets...</div>
      ) : snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <Code2 size={48} className="mb-4 text-slate-300" />
          <p>No snippets found.</p>
          <Button onClick={openNew} variant="outline" className="mt-4">Create your first snippet</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {snippets.map(snippet => (
            <Card key={snippet.id} className="flex flex-col h-[320px] hover:border-blue-300 transition-colors group overflow-hidden">
              <CardHeader className="p-4 pb-0 bg-slate-50 flex-col space-y-2 border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div className="truncate pr-2">
                    <CardTitle className="text-base truncate" title={snippet.name}>{snippet.name}</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{snippet.description || 'No description'}</p>
                  </div>
                  <div className="flex space-x-1 shrink-0 -mt-1 -mr-1">
                    <button onClick={() => handleCopy(snippet.id, snippet.code)} className="p-1.5 rounded hover:bg-slate-200 text-slate-500 transition-colors" title="Copy code">
                      {copiedId === snippet.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                    </button>
                    <button onClick={() => handleToggleFavorite(snippet.id)} className="p-1.5 rounded hover:bg-slate-200 text-slate-400 transition-colors">
                      <Star size={16} fill={snippet.isFavorite ? 'currentColor' : 'none'} className={snippet.isFavorite ? 'text-amber-500' : ''} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-[11px] font-mono font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    {snippet.language}
                  </span>
                  {snippet.category && (
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      {snippet.category}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <div className="flex-1 overflow-hidden relative text-sm text-[13px] bg-white border-b border-slate-100">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <CodeMirror
                    value={snippet.code}
                    extensions={getLanguageExtension(snippet.language)}
                    editable={false}
                    theme="light"
                    basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
                    className="h-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 flex items-center justify-between text-xs text-slate-400 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{timeAgo(snippet.updatedAt || snippet.createdAt)}</span>
                <div className="flex space-x-1">
                  <button onClick={() => { setCurrentSnippet(snippet); setIsModalOpen(true); }} className="p-1.5 rounded hover:bg-slate-200 hover:text-blue-600"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(snippet.id)} className="p-1.5 rounded hover:bg-slate-200 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentSnippet.id ? 'Edit Snippet' : 'New Snippet'} maxWidth="2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={currentSnippet.name || ''} onChange={e => setCurrentSnippet({...currentSnippet, name: e.target.value})} required placeholder="E.g. Auth Middleware" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Language</label>
              <select 
                value={currentSnippet.language} onChange={e => setCurrentSnippet({...currentSnippet, language: e.target.value})}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript / TS</option>
                <option value="python">Python</option>
                <option value="sql">SQL</option>
                <option value="html">HTML / CSS</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Input value={currentSnippet.category || ''} onChange={e => setCurrentSnippet({...currentSnippet, category: e.target.value})} placeholder="E.g. Backend" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Input value={currentSnippet.description || ''} onChange={e => setCurrentSnippet({...currentSnippet, description: e.target.value})} placeholder="What does this code do?" />
          </div>
          
          <div className="space-y-1 border border-slate-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <CodeMirror
              value={currentSnippet.code || ''}
              height="300px"
              theme="light"
              extensions={getLanguageExtension(currentSnippet.language || 'javascript')}
              onChange={(val) => setCurrentSnippet({...currentSnippet, code: val})}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Snippet'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
