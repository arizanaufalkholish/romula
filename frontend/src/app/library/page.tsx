'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { FileItem } from '@/lib/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, File as FileIcon, Image as ImageIcon, FileText, Download, Trash2, UploadCloud } from 'lucide-react';
import { formatRupiah, timeAgo, truncate } from '@/lib/utils';

export default function LibraryPage() {
  const [files, setFiles] = React.useState<FileItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchFiles = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{items: FileItem[]}>(`/files?search=${search}`);
      setFiles(res.items);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [search]);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchFiles(), 300);
    return () => clearTimeout(timer);
  }, [fetchFiles, search]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);

    try {
      await api.post('/files', formData);
      fetchFiles();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus file ini permanen?')) return;
    try {
      await api.delete(`/files/${id}`);
      fetchFiles();
    } catch (err) { console.error(err); }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon size={32} className="text-blue-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText size={32} className="text-rose-500" />;
    return <FileIcon size={32} className="text-slate-500" />;
  };

  return (
    <div>
      <PageHeader title="Library Vault" description="Store your scientific data, PDFs, images, and files securely." >
        <div className="relative w-64 mr-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="pl-9 h-9" />
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white mr-2"></div> : <UploadCloud size={16} className="mr-2" />}
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </PageHeader>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl bg-white focus-within:ring-2 hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <UploadCloud size={48} className="mb-4 text-slate-300" />
          <p className="font-medium text-slate-900">Upload your first file</p>
          <p className="text-sm">Drag and drop or click to upload</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {files.map(file => (
            <Card key={file.id} className="group relative overflow-hidden transition-all hover:shadow-md hover:border-blue-300">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center h-40 bg-slate-50/50">
                {getFileIcon(file.mimeType)}
                <h3 className="mt-3 font-medium text-slate-900 truncate w-full text-sm" title={file.originalName}>
                  {file.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {timeAgo(file.createdAt)}
                </p>
                <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900/5 backdrop-blur-[1px] flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/files/${file.id}/download?token=${typeof window !== 'undefined' ? localStorage.getItem('romula_token') : ''}`} download className="p-2 bg-white rounded-full text-slate-700 hover:text-blue-600 shadow-sm" title="Download">
                    <Download size={18} />
                  </a>
                  <button onClick={() => handleDelete(file.id)} className="p-2 bg-white rounded-full text-slate-700 hover:text-red-600 shadow-sm" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
