'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { TableItem } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Star, Trash2, Edit, Table as TableIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

export default function TablesPage() {
  const [items, setItems] = React.useState<TableItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState<Partial<TableItem>>({});
  const [columnsInput, setColumnsInput] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{items: TableItem[]}>(`/tables?search=${search}`);
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
    if (!currentItem.name) return;
    setIsSaving(true);
    
    // Parse columns array from string (comma separated)
    const colsArray = columnsInput.split(',').map(c => c.trim()).filter(Boolean);
    const payload = {
      ...currentItem,
      columns: JSON.stringify(colsArray),
      rows: currentItem.rows || '[]',
    };

    try {
      if (currentItem.id) {
        await api.put(`/tables/${currentItem.id}`, payload);
      } else {
        await api.post(`/tables`, payload);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus tabel ini? (Data row juga akan hilang)')) return;
    try {
      await api.delete(`/tables/${id}`);
      fetchItems();
    } catch (err) { console.error(err); }
  };

  const openNew = () => {
    setCurrentItem({ name: '', category: 'Dataset', rows: '[]' });
    setColumnsInput('ID, Name, Value, Date');
    setIsModalOpen(true);
  };

  const openEdit = (item: TableItem) => {
    let cols = [];
    try { cols = JSON.parse(item.columns); } catch(e){}
    setColumnsInput(cols.join(', '));
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  return (
    <div>
      <PageHeader title="Data Tables" description="Manage structured datasets and CSV records." actionText="New Table" onAction={openNew}>
        <div className="relative w-64 mr-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tables..." className="pl-9 h-9" />
        </div>
      </PageHeader>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading tables...</div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <TableIcon size={48} className="mb-4 text-slate-300" />
          <p>No tables found.</p>
          <Button onClick={openNew} variant="outline" className="mt-4">Create your first table</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {items.map(item => {
            let cols: string[] = [];
            let rows: any[] = [];
            try { cols = JSON.parse(item.columns); } catch(e){}
            try { rows = JSON.parse(item.rows); } catch(e){}

            return (
              <Card key={item.id} className="flex flex-col h-auto">
                <CardHeader className="p-4 pb-3 border-b border-slate-100 flex-col space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
                        <TableIcon size={16} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold leading-tight">{item.name}</CardTitle>
                        <p className="text-xs text-slate-500">{cols.length} columns • {rows.length} rows</p>
                      </div>
                    </div>
                    <div className="flex space-x-1 -mt-1 -mr-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table className="text-xs whitespace-nowrap min-w-full border-0">
                    <TableHeader className="bg-slate-50 border-0 rounded-none">
                      <TableRow className="border-b border-slate-100 hover:bg-transparent">
                        {cols.slice(0, 4).map((c, i) => (
                          <TableHead key={i} className="h-8 py-1">{c}</TableHead>
                        ))}
                        {cols.length > 4 && <TableHead className="h-8 py-1">...</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.slice(0, 3).map((row, i) => (
                        <TableRow key={i} className="border-b border-slate-50">
                          {cols.slice(0, 4).map((c, j) => (
                            <TableCell key={j} className="py-2">{row[c] !== undefined ? String(row[c]) : '-'}</TableCell>
                          ))}
                          {cols.length > 4 && <TableCell className="py-2 text-slate-400">...</TableCell>}
                        </TableRow>
                      ))}
                      {rows.length === 0 && (
                        <TableRow><TableCell colSpan={cols.length > 4 ? 5 : cols.length} className="py-4 text-center text-slate-400 text-xs">Empty Table. Click Edit to add JSON rows.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem.id ? 'Edit Table Settings' : 'New Table'} maxWidth="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Table Name</label>
            <Input value={currentItem.name || ''} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} required placeholder="E.g. Users List" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <Input value={currentItem.category || ''} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} placeholder="E.g. Dataset" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Columns (comma separated)</label>
            <Input value={columnsInput} onChange={e => setColumnsInput(e.target.value)} required placeholder="ID, Name, Email, Role" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Rows Data (JSON Array)</label>
            <textarea 
              value={currentItem.rows || '[]'} onChange={e => setCurrentItem({...currentItem, rows: e.target.value})}
              className="flex w-full rounded-md border border-slate-300 bg-slate-50 font-mono text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              placeholder='[{"ID": 1, "Name": "John"}]'
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Table'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
