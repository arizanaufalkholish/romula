'use client';

import * as React from 'react';
import { Title } from '@/components/ui/Title';
import { Card, CardContent } from '@/components/ui/Card';
import {
  FileText, Folder, Code2, Newspaper, Wallet, Users, LayoutDashboard, Terminal, Database 
} from 'lucide-react';
import { api } from '@/lib/api';
import { useStore } from '@/store';
import { formatRupiah, timeAgo } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const { user } = useStore();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.get('/analytics')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Notes', value: data.counts.notes, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100', href: '/notes' },
    { label: 'Library', value: data.counts.files, icon: Folder, color: 'text-cyan-600', bg: 'bg-cyan-100', href: '/library' },
    { label: 'Snippets', value: data.counts.codeSnippets, icon: Code2, color: 'text-emerald-600', bg: 'bg-emerald-100', href: '/code' },
    { label: 'Tables', value: data.counts.tables, icon: Database, color: 'text-amber-600', bg: 'bg-amber-100', href: '/tables' },
    { label: 'SQL', value: data.counts.sqlItems, icon: Terminal, color: 'text-rose-600', bg: 'bg-rose-100', href: '/sql' },
    { label: 'News', value: data.counts.news, icon: Newspaper, color: 'text-fuchsia-600', bg: 'bg-fuchsia-100', href: '/news' },
    { label: 'Finance', value: formatRupiah(data.finance.balance), icon: Wallet, color: 'text-sky-600', bg: 'bg-sky-100', href: '/finance' },
    { label: 'People', value: data.counts.people, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', href: '/people' },
  ];

  // Convert activityPerDay object to array for Recharts
  const activityData = Object.entries(data.activityPerDay).map(([date, count]) => ({
    date: date.substring(5), // MM-DD
    count
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 🚀
          </h1>
          <p className="text-sm text-slate-500">Here is your ROMULA research and learning summary.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <a key={i} href={s.href} className="block group">
            <Card className="transition-shadow hover:shadow-md hover:border-blue-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Activity Chart */}
        <Card className="col-span-2">
          <div className="p-6 pb-2">
            <h3 className="font-semibold leading-none tracking-tight">Active Days (Last 30 Days)</h3>
          </div>
          <CardContent className="p-6 pt-4 h-[300px]">
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                No activity yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <div className="p-6 pb-2 border-b border-slate-100">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
          </div>
          <CardContent className="p-0 overflow-y-auto max-h-[300px]">
            {data.recentActivities.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.recentActivities.map((act: any) => (
                  <div key={act.id} className="flex flex-col p-4 hover:bg-slate-50">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2 w-2 rounded-full ${act.action === 'create' ? 'bg-emerald-500' : act.action === 'delete' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                      <span className="text-sm font-medium text-slate-900 capitalize">{act.action}</span>
                      <span className="text-xs text-slate-500">• {timeAgo(act.createdAt)}</span>
                    </div>
                    <div className="mt-1 flex items-start pl-4 space-x-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{act.module}</span>
                      <span className="text-sm text-slate-600 truncate">{act.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-slate-500">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
