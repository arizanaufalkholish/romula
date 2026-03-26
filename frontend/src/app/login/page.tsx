'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@romula.app');
  const [password, setPassword] = useState('romula123');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const setUser = useStore(state => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };
      
      const data = await api.post<{ token: string, user: any }>(endpoint, body);
      
      localStorage.setItem('romula_token', data.token);
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 pb-1">
            <span className="text-3xl font-bold text-blue-600">R</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            {isLogin ? 'Masuk ke ROMULA' : 'Daftar ROMULA'}
          </CardTitle>
          <p className="text-sm text-slate-500">
            {isLogin ? 'Masukkan email dan password untuk melanjutkan' : 'Buat akun untuk memulai'}
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                <Input 
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Doe" required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com" required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input 
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6}
              />
            </div>
            
            <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
              ) : (
                isLogin ? 'Masuk' : 'Daftar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
