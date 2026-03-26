'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { useStore } from '@/store';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Download, Upload, Moon, Sun, Info, Shield, Save } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser, theme, toggleTheme } = useStore();
  const [name, setName] = React.useState(user?.name || '');
  const [saving, setSaving] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await api.post<any>('/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `romula-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('Data exported successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      const res = await api.post<{ imported: number }>('/import', data);
      setMessage(`Successfully imported ${res.imported} items!`);
      setImportFile(null);
    } catch (err) {
      console.error(err);
      setMessage('Import failed. Check file format.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile, preferences, and data." />

      {/* User Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">User Profile</h3>
              <p className="text-sm text-slate-500">Your account information</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input value={user?.email || ''} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <div className="flex items-center h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md">
                <Shield size={14} className="mr-2 text-blue-500" />
                <span className="capitalize text-slate-700">{user?.role || 'user'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Member Since</label>
              <div className="flex items-center h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-700">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
              <p className="text-sm text-slate-500">Customize how ROMULA looks</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">Theme</p>
              <p className="text-sm text-slate-500">Current: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={16} className="mr-2" /> : <Sun size={16} className="mr-2" />}
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export & Import */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Download size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Data Management</h3>
              <p className="text-sm text-slate-500">Export, import, and backup your data</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Export All Data</p>
                <p className="text-sm text-slate-500">Download all your data as a JSON file</p>
              </div>
              <Button variant="outline" onClick={handleExport} disabled={exporting}>
                <Download size={16} className="mr-2" />
                {exporting ? 'Exporting...' : 'Export JSON'}
              </Button>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div>
                <p className="font-medium text-slate-900">Import Data</p>
                <p className="text-sm text-slate-500">Restore data from a previously exported JSON file</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={e => setImportFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
                />
                <Button onClick={handleImport} disabled={!importFile || importing} variant="outline">
                  <Upload size={16} className="mr-2" />
                  {importing ? 'Importing...' : 'Import'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Info size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">About ROMULA</h3>
              <p className="text-sm text-slate-500">Personal Research OS</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Version</p>
              <p className="font-medium text-slate-900">1.0.0</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Stack</p>
              <p className="font-medium text-slate-900">Next.js + Express + Prisma</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Messages */}
      {message && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-blue-400 hover:text-blue-600 ml-4">&times;</button>
        </div>
      )}
    </div>
  );
}
