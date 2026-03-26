'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { FinanceRecord } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Search, Trash2, Edit, TrendingUp, TrendingDown, Calendar, Wallet } from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';

export default function FinancePage() {
  const [records, setRecords] = React.useState<FinanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentRec, setCurrentRec] = React.useState<Partial<FinanceRecord>>({ type: 'expense', date: new Date().toISOString().split('T')[0] });
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const fetchRecords = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{items: FinanceRecord[]}>(`/finance?search=${search}&sortBy=date&sortOrder=desc`);
      setRecords(res.items);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchRecords(), 300);
    return () => clearTimeout(timer);
  }, [fetchRecords, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      if (currentRec.id) {
        await api.put(`/finance/${currentRec.id}`, currentRec);
      } else {
        await api.post(`/finance`, currentRec);
      }
      setIsModalOpen(false);
      fetchRecords();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await api.delete(`/finance/${id}`);
      fetchRecords();
    } catch (err) { console.error(err); }
  };

  const openNew = (type: 'income' | 'expense') => {
    setCurrentRec({ type, amount: 0, description: '', category: 'General', date: new Date().toISOString().split('T')[0] });
    setError('');
    setIsModalOpen(true);
  };

  const totalIncome = records.filter(r => r.type==='income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = records.filter(r => r.type==='expense').reduce((a, b) => a + b.amount, 0);

  return (
    <div>
      <PageHeader title="Finance Tracker" description="Manage personal finances, income, and expenses." >
        <div className="relative w-64 mr-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..." className="pl-9 h-9" />
        </div>
        <Button onClick={() => openNew('income')} className="bg-emerald-600 hover:bg-emerald-700">
          <TrendingUp size={16} className="mr-2" /> Income
        </Button>
        <Button onClick={() => openNew('expense')} variant="danger">
          <TrendingDown size={16} className="mr-2" /> Expense
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card><CardContent className="p-5 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500">Balance</p><p className="text-2xl font-bold text-slate-900">{formatRupiah(totalIncome - totalExpense)}</p></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Wallet size={24} /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500">Income</p><p className="text-2xl font-bold text-emerald-600">{formatRupiah(totalIncome)}</p></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><TrendingUp size={24} /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5 flex items-center justify-between">
          <div><p className="text-sm font-medium text-slate-500">Expense</p><p className="text-2xl font-bold text-red-600">{formatRupiah(totalExpense)}</p></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600"><TrendingDown size={24} /></div>
        </CardContent></Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">No records found</TableCell></TableRow>
            ) : (
              records.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-slate-500 whitespace-nowrap"><Calendar size={14} className="inline mr-2" />{formatDate(r.date)}</TableCell>
                  <TableCell className="font-medium">{r.description}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs capitalize">{r.category}</span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${r.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {r.type === 'income' ? '+' : '-'}{formatRupiah(r.amount)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap space-x-2">
                    <button onClick={() => { setCurrentRec(r); setIsModalOpen(true); }} className="text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentRec.id ? 'Edit Record' : 'New Record'}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Type</label>
              <select 
                value={currentRec.type} onChange={e => setCurrentRec({...currentRec, type: e.target.value as 'income'|'expense'})}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={currentRec.date || ''} onChange={e => setCurrentRec({...currentRec, date: e.target.value})} required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Input value={currentRec.description || ''} onChange={e => setCurrentRec({...currentRec, description: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" min="0" value={currentRec.amount || ''} onChange={e => setCurrentRec({...currentRec, amount: Number(e.target.value)})} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Input value={currentRec.category || ''} onChange={e => setCurrentRec({...currentRec, category: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Record'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


