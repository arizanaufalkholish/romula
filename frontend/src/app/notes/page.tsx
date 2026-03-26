'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { NoteItem } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Star, Trash2, Edit, BookOpen } from 'lucide-react';
import { timeAgo, truncate } from '@/lib/utils';

export default function NotesPage() {
  const [notes, setNotes] = React.useState<NoteItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentNote, setCurrentNote] = React.useState<Partial<NoteItem>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchNotes = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{items: NoteItem[]}>(`/notes?search=${search}`);
      setNotes(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchNotes(), 300);
    return () => clearTimeout(timer);
  }, [fetchNotes, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNote.title) return;
    setIsSaving(true);
    try {
      if (currentNote.id) {
        await api.put(`/notes/${currentNote.id}`, currentNote);
      } else {
        await api.post(`/notes`, currentNote);
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) { console.error(err); }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.patch(`/notes/${id}/favorite`);
      fetchNotes();
    } catch (err) { console.error(err); }
  };

  const openNewNote = () => {
    setCurrentNote({ title: '', content: '', summary: '', category: 'General' });
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader 
        title="Notes Editor" 
        description="Write, organize, and manage your long-form notes and research."
        actionText="New Note"
        onAction={openNewNote}
      >
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..." className="pl-9 h-9"
          />
        </div>
      </PageHeader>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <BookOpen size={48} className="mb-4 text-slate-300" />
          <p>No notes found.</p>
          <Button onClick={openNewNote} variant="outline" className="mt-4">Write your first note</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map(note => (
            <Card key={note.id} className="flex flex-col h-[240px] hover:border-blue-300 transition-colors group">
              <CardHeader className="p-4 pb-2 border-b border-slate-50 flex-col space-y-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base truncate" title={note.title}>{note.title}</CardTitle>
                  <button onClick={() => handleToggleFavorite(note.id)} className="shrink-0 -mt-1 -mr-1 p-2 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-500">
                    <Star size={16} fill={note.isFavorite ? 'currentColor' : 'none'} className={note.isFavorite ? 'text-amber-500' : ''} />
                  </button>
                </div>
                {note.category && (
                  <span className="inline-block px-2 text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-500 rounded">
                    {note.category}
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-3 flex-1 overflow-hidden">
                <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">
                  {note.content || note.summary || 'Empty note'}
                </p>
              </CardContent>
              <div className="p-4 pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{timeAgo(note.updatedAt || note.createdAt)}</span>
                <div className="flex space-x-1">
                  <button onClick={() => { setCurrentNote(note); setIsModalOpen(true); }} className="p-1.5 rounded hover:bg-slate-100 hover:text-blue-600"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(note.id)} className="p-1.5 rounded hover:bg-slate-100 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} 
        title={currentNote.id ? 'Edit Note' : 'New Note'} 
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1 col-span-3">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={currentNote.title || ''} 
                onChange={e => setCurrentNote({...currentNote, title: e.target.value})} 
                required placeholder="Enter note title..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Input 
                value={currentNote.category || ''} 
                onChange={e => setCurrentNote({...currentNote, category: e.target.value})} 
                placeholder="e.g. Research"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Content</label>
            <textarea 
              value={currentNote.content || ''} 
              onChange={e => setCurrentNote({...currentNote, content: e.target.value})} 
              className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-sans text-sm"
              placeholder="Write your note here... (Markdown supported)"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Note'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
