'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { NewsItem } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Star, Trash2, Edit, Newspaper, ExternalLink, CheckCircle } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export default function NewsPage() {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState<Partial<NewsItem>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const fetchNews = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{items: NewsItem[]}>(`/news?search=${search}&sortBy=createdAt&sortOrder=desc`);
      setNews(res.items);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchNews(), 300);
    return () => clearTimeout(timer);
  }, [fetchNews, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem.title) return;
    setIsSaving(true);
    setError('');
    try {
      if (currentItem.id) {
        await api.put(`/news/${currentItem.id}`, currentItem);
      } else {
        await api.post(`/news`, currentItem);
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (err: any) { 
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus berita ini?')) return;
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch (err) { console.error(err); }
  };

  const handleToggleState = async (id: string, field: 'favorite' | 'read', currentVal: boolean) => {
    try {
      if (field === 'favorite') {
        await api.patch(`/news/${id}/favorite`);
      } else {
        await api.put(`/news/${id}`, { isRead: !currentVal });
      }
      fetchNews();
    } catch (err) { console.error(err); }
  };

  const openNew = () => {
    setCurrentItem({ title: '', content: '', source: '', link: '', category: 'Tech', isRead: false });
    setError('');
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader title="News Board" description="Track important technology, business news, and articles." actionText="Add News" onAction={openNew}>
        <div className="relative w-64 mr-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..." className="pl-9 h-9" />
        </div>
      </PageHeader>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading news...</div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <Newspaper size={48} className="mb-4 text-slate-300" />
          <p>No news found.</p>
          <Button onClick={openNew} variant="outline" className="mt-4">Save an article</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.map(item => (
            <Card key={item.id} className={`flex flex-col h-[280px] hover:border-blue-300 transition-colors group ${item.isRead ? 'opacity-70 bg-slate-50' : 'bg-white'}`}>
              <CardHeader className="p-4 pb-2 flex-col space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 w-full pr-2">
                    {!item.isRead && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500"></span>}
                    <CardTitle className="text-base truncate leading-tight" title={item.title}>{item.title}</CardTitle>
                  </div>
                  <button onClick={() => handleToggleState(item.id, 'favorite', item.isFavorite)} className="shrink-0 -mt-1 -mr-1 p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-500">
                    <Star size={16} fill={item.isFavorite ? 'currentColor' : 'none'} className={item.isFavorite ? 'text-amber-500' : ''} />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-blue-600">{item.source || 'Unknown Source'}</span>
                  <span>{timeAgo(item.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-1 overflow-hidden">
                <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">
                  {item.content}
                </p>
                {item.category && (
                  <span className="inline-block mt-3 px-2 text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-500 rounded">
                    {item.category}
                  </span>
                )}
              </CardContent>
              <div className="p-4 pt-0 flex items-center justify-between text-slate-400 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <button onClick={() => handleToggleState(item.id, 'read', item.isRead)} className={`p-1.5 flex items-center space-x-1 rounded text-xs ${item.isRead ? 'text-emerald-600 bg-emerald-50' : 'hover:bg-slate-100 hover:text-slate-700'}`}>
                    <CheckCircle size={14} /> <span>{item.isRead ? 'Read' : 'Mark as read'}</span>
                  </button>
                </div>
                <div className="flex space-x-1">
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-slate-100 hover:text-blue-600" title="Open original">
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="p-1.5 rounded hover:bg-slate-100 hover:text-blue-600"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-slate-100 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem.id ? 'Edit News' : 'Add News'} maxWidth="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-medium">Headline Title</label>
            <Input value={currentItem.title || ''} onChange={e => setCurrentItem({...currentItem, title: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Source</label>
              <Input value={currentItem.source || ''} onChange={e => setCurrentItem({...currentItem, source: e.target.value})} placeholder="E.g. TechCrunch" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Input value={currentItem.category || ''} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Original Link URL</label>
            <Input type="url" value={currentItem.link || ''} onChange={e => setCurrentItem({...currentItem, link: e.target.value})} placeholder="https://..." />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Summary / Content</label>
            <textarea 
              value={currentItem.content || ''} onChange={e => setCurrentItem({...currentItem, content: e.target.value})}
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save News'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
