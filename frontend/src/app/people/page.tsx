'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { PersonItem } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Star, Trash2, Edit, Mail, Phone, Briefcase, Users } from 'lucide-react';

export default function PeoplePage() {
  const [people, setPeople] = React.useState<PersonItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentPerson, setCurrentPerson] = React.useState<Partial<PersonItem>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchPeople = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{items: PersonItem[]}>(`/people?search=${search}`);
      setPeople(res.items);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchPeople(), 300);
    return () => clearTimeout(timer);
  }, [fetchPeople, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPerson.name) return;
    setIsSaving(true);
    try {
      if (currentPerson.id) {
        await api.put(`/people/${currentPerson.id}`, currentPerson);
      } else {
        await api.post(`/people`, currentPerson);
      }
      setIsModalOpen(false);
      fetchPeople();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kontak ini?')) return;
    try {
      await api.delete(`/people/${id}`);
      fetchPeople();
    } catch (err) { console.error(err); }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.patch(`/people/${id}/favorite`);
      fetchPeople();
    } catch (err) { console.error(err); }
  };

  const openNew = () => {
    setCurrentPerson({ name: '', email: '', phone: '', org: '', role: '', notes: '', category: 'Work' });
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader title="People Directory" description="Manage your contacts, colleagues, and network." actionText="Add Person" onAction={openNew}>
        <div className="relative w-64 mr-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people..." className="pl-9 h-9" />
        </div>
      </PageHeader>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading contacts...</div>
      ) : people.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <Users size={48} className="mb-4 text-slate-300" />
          <p>No contacts found.</p>
          <Button onClick={openNew} variant="outline" className="mt-4">Add your first contact</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {people.map(person => (
            <Card key={person.id} className="relative overflow-hidden group hover:border-blue-300 transition-colors">
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 leading-tight">{person.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{person.role} {person.org && `at ${person.org}`}</p>
                    </div>
                  </div>
                  <button onClick={() => handleToggleFavorite(person.id)} className="text-slate-400 hover:text-amber-500 -mt-1 -mr-1 p-1">
                    <Star size={16} fill={person.isFavorite ? 'currentColor' : 'none'} className={person.isFavorite ? 'text-amber-500' : ''} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-2 text-sm text-slate-600 mt-3">
                  {person.email && <div className="flex items-center"><Mail size={14} className="mr-2 text-slate-400" /> <a href={`mailto:${person.email}`} className="hover:text-blue-600 truncate">{person.email}</a></div>}
                  {person.phone && <div className="flex items-center"><Phone size={14} className="mr-2 text-slate-400" /> <span>{person.phone}</span></div>}
                </div>
                {person.category && (
                  <div className="mt-4">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">
                      {person.category}
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setCurrentPerson(person); setIsModalOpen(true); }} className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 shadow-sm" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(person.id)} className="p-2 bg-white rounded-full text-slate-700 hover:text-red-600 shadow-sm" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentPerson.id ? 'Edit Person' : 'New Person'} maxWidth="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <Input value={currentPerson.name || ''} onChange={e => setCurrentPerson({...currentPerson, name: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={currentPerson.email || ''} onChange={e => setCurrentPerson({...currentPerson, email: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <Input type="tel" value={currentPerson.phone || ''} onChange={e => setCurrentPerson({...currentPerson, phone: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Organization</label>
              <Input value={currentPerson.org || ''} onChange={e => setCurrentPerson({...currentPerson, org: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Role / Job Title</label>
              <Input value={currentPerson.role || ''} onChange={e => setCurrentPerson({...currentPerson, role: e.target.value})} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Category / Group</label>
            <Input value={currentPerson.category || ''} onChange={e => setCurrentPerson({...currentPerson, category: e.target.value})} placeholder="E.g. Colleague, Family" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Notes</label>
            <textarea 
              value={currentPerson.notes || ''} onChange={e => setCurrentPerson({...currentPerson, notes: e.target.value})}
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Person'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
