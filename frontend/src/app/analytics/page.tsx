'use client';

import * as React from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  FileText, Folder, Code2, Newspaper, Wallet, Users, Terminal, Database, TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AnalyticsPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.get<any>('/analytics')
      .then((res) => { setData(res); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  const moduleStats = [
    { name: 'Notes', value: data.counts.notes, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Files', value: data.counts.files, icon: Folder, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: 'Snippets', value: data.counts.codeSnippets, icon: Code2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Tables', value: data.counts.tables, icon: Database, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'SQL', value: data.counts.sqlItems, icon: Terminal, color: 'text-rose-600', bg: 'bg-rose-100' },
    { name: 'News', value: data.counts.news, icon: Newspaper, color: 'text-fuchsia-600', bg: 'bg-fuchsia-100' },
    { name: 'People', value: data.counts.people, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Transactions', value: data.counts.transactions, icon: Wallet, color: 'text-sky-600', bg: 'bg-sky-100' },
  ];

  // Activity per day chart data
  const activityData = Object.entries(data.activityPerDay || {}).map(([date, count]) => ({
    date: date.substring(5),
    count,
  }));

  // Monthly finance chart data
  const monthlyData = Object.entries(data.finance.monthlyFinance || {}).map(([month, vals]: [string, any]) => ({
    month: month.substring(5),
    income: vals.income,
    expense: vals.expense,
  }));

  // Expense by category pie data
  const expenseCategories = Object.entries(data.finance.expenseByCategory || {}).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Statistics across all your ROMULA modules." />

      {/* Module counts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {moduleStats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{s.name}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Finance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Income</p>
              <p className="text-2xl font-bold text-emerald-600">{formatRupiah(data.finance.totalIncome)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">{formatRupiah(data.finance.totalExpense)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Balance</p>
              <p className="text-2xl font-bold text-slate-900">{formatRupiah(data.finance.balance)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Wallet className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Chart */}
        <Card>
          <div className="p-6 pb-2 border-b border-slate-100">
            <h3 className="font-semibold leading-none tracking-tight flex items-center">
              <Activity size={18} className="mr-2 text-blue-600" /> Activity (Last 30 Days)
            </h3>
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
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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

        {/* Monthly Finance Bar Chart */}
        <Card>
          <div className="p-6 pb-2 border-b border-slate-100">
            <h3 className="font-semibold leading-none tracking-tight flex items-center">
              <Wallet size={18} className="mr-2 text-emerald-600" /> Monthly Finance
            </h3>
          </div>
          <CardContent className="p-6 pt-4 h-[300px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                No finance data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense By Category */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="p-6 pb-2 border-b border-slate-100">
            <h3 className="font-semibold leading-none tracking-tight">Expense by Category</h3>
          </div>
          <CardContent className="p-6 pt-4 h-[300px]">
            {expenseCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseCategories} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {expenseCategories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                No expense data
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
                      <span className="text-xs text-slate-400">• {act.module}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 pl-4 truncate">{act.detail}</p>
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
