import { Router, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { formatApiResponse, getUserId, logActivity } from '../utils/helpers';

const router = Router();
router.use(authMiddleware);

// GET /api/analytics — Aggregate stats for dashboard
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const [files, tables, people, sqlItems, codeSnippets, notes, news, finance, tags, activities] = await Promise.all([
      prisma.fileItem.count({ where: { userId } }),
      prisma.tableItem.count({ where: { userId } }),
      prisma.personItem.count({ where: { userId } }),
      prisma.sqlItem.count({ where: { userId } }),
      prisma.codeSnippet.count({ where: { userId } }),
      prisma.noteItem.count({ where: { userId } }),
      prisma.newsItem.count({ where: { userId } }),
      prisma.financeRecord.findMany({ where: { userId }, select: { type: true, amount: true, category: true, date: true } }),
      prisma.tag.count({ where: { userId } }),
      prisma.activityLog.count({ where: { userId } }),
    ]);

    const totalIncome = finance.filter(f => f.type === 'income').reduce((a, f) => a + f.amount, 0);
    const totalExpense = finance.filter(f => f.type === 'expense').reduce((a, f) => a + f.amount, 0);

    // Monthly finance breakdown
    const monthlyFinance: Record<string, { income: number; expense: number }> = {};
    finance.forEach(f => {
      const month = f.date.slice(0, 7); // YYYY-MM
      if (!monthlyFinance[month]) monthlyFinance[month] = { income: 0, expense: 0 };
      monthlyFinance[month][f.type as 'income' | 'expense'] += f.amount;
    });

    // Expense by category
    const expenseByCategory: Record<string, number> = {};
    finance.filter(f => f.type === 'expense').forEach(f => {
      expenseByCategory[f.category] = (expenseByCategory[f.category] || 0) + f.amount;
    });

    // Recent activities
    const recentActivities = await prisma.activityLog.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' }, take: 20,
    });

    // Activity per day (last 30 days)
    const activityPerDay: Record<string, number> = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentLogs = await prisma.activityLog.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    recentLogs.forEach(l => {
      const day = l.createdAt.toISOString().split('T')[0];
      activityPerDay[day] = (activityPerDay[day] || 0) + 1;
    });

    res.json(formatApiResponse({
      counts: { files, tables, people, sqlItems, codeSnippets, notes, news, transactions: finance.length, tags, activities },
      finance: { totalIncome, totalExpense, balance: totalIncome - totalExpense, monthlyFinance, expenseByCategory },
      recentActivities,
      activityPerDay,
    }));
  } catch (err) { next(err); }
});

// GET /api/search?q=query
router.get('/search', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const q = String(req.query.q || '');
    if (q.length < 2) return res.json(formatApiResponse({ results: [] }));

    const [notes, code, sql, news, people, files] = await Promise.all([
      prisma.noteItem.findMany({ where: { userId, isArchived: false, OR: [{ title: { contains: q } }, { content: { contains: q } }] }, take: 10, select: { id: true, title: true, category: true, createdAt: true } }),
      prisma.codeSnippet.findMany({ where: { userId, isArchived: false, OR: [{ name: { contains: q } }, { code: { contains: q } }, { description: { contains: q } }] }, take: 10, select: { id: true, name: true, language: true, createdAt: true } }),
      prisma.sqlItem.findMany({ where: { userId, isArchived: false, OR: [{ name: { contains: q } }, { query: { contains: q } }] }, take: 10, select: { id: true, name: true, createdAt: true } }),
      prisma.newsItem.findMany({ where: { userId, isArchived: false, OR: [{ title: { contains: q } }, { content: { contains: q } }] }, take: 10, select: { id: true, title: true, category: true, createdAt: true } }),
      prisma.personItem.findMany({ where: { userId, isArchived: false, OR: [{ name: { contains: q } }, { email: { contains: q } }, { org: { contains: q } }] }, take: 10, select: { id: true, name: true, org: true, createdAt: true } }),
      prisma.fileItem.findMany({ where: { userId, isArchived: false, OR: [{ name: { contains: q } }, { originalName: { contains: q } }] }, take: 10, select: { id: true, name: true, mimeType: true, createdAt: true } }),
    ]);

    const results = [
      ...notes.map(i => ({ id: i.id, type: 'notes', title: i.title, subtitle: i.category, createdAt: i.createdAt })),
      ...code.map(i => ({ id: i.id, type: 'code', title: i.name, subtitle: i.language, createdAt: i.createdAt })),
      ...sql.map(i => ({ id: i.id, type: 'sql', title: i.name, subtitle: 'SQL', createdAt: i.createdAt })),
      ...news.map(i => ({ id: i.id, type: 'news', title: i.title, subtitle: i.category, createdAt: i.createdAt })),
      ...people.map(i => ({ id: i.id, type: 'people', title: i.name, subtitle: i.org, createdAt: i.createdAt })),
      ...files.map(i => ({ id: i.id, type: 'files', title: i.name, subtitle: i.mimeType, createdAt: i.createdAt })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(formatApiResponse({ results }));
  } catch (err) { next(err); }
});

// GET /api/activities
router.get('/activities', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const items = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(String(req.query.limit || '50')),
    });
    res.json(formatApiResponse(items));
  } catch (err) { next(err); }
});

// POST /api/export — Export all user data as JSON
router.post('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const [files, tables, people, sqlItems, codeSnippets, notes, news, finance, tags, bookmarks] = await Promise.all([
      prisma.fileItem.findMany({ where: { userId } }),
      prisma.tableItem.findMany({ where: { userId } }),
      prisma.personItem.findMany({ where: { userId } }),
      prisma.sqlItem.findMany({ where: { userId } }),
      prisma.codeSnippet.findMany({ where: { userId } }),
      prisma.noteItem.findMany({ where: { userId } }),
      prisma.newsItem.findMany({ where: { userId } }),
      prisma.financeRecord.findMany({ where: { userId } }),
      prisma.tag.findMany({ where: { userId } }),
      prisma.bookmark.findMany({ where: { userId } }),
    ]);
    res.json(formatApiResponse({ files, tables, people, sqlItems, codeSnippets, notes, news, finance, tags, bookmarks, exportedAt: new Date().toISOString() }));
  } catch (err) { next(err); }
});

// POST /api/import — Import user data from JSON
router.post('/import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const data = req.body;
    let imported = 0;

    if (data.notes?.length) {
      for (const n of data.notes) {
        await prisma.noteItem.create({ data: { userId, title: n.title, content: n.content || '', summary: n.summary || '', category: n.category || '' } });
        imported++;
      }
    }
    if (data.codeSnippets?.length) {
      for (const c of data.codeSnippets) {
        await prisma.codeSnippet.create({ data: { userId, name: c.name, code: c.code, language: c.language || 'javascript', description: c.description || '', category: c.category || '' } });
        imported++;
      }
    }
    if (data.sqlItems?.length) {
      for (const s of data.sqlItems) {
        await prisma.sqlItem.create({ data: { userId, name: s.name, query: s.query, result: s.result || '', description: s.description || '', category: s.category || '' } });
        imported++;
      }
    }
    if (data.news?.length) {
      for (const n of data.news) {
        await prisma.newsItem.create({ data: { userId, title: n.title, content: n.content || '', source: n.source || '', link: n.link || '', category: n.category || 'tech' } });
        imported++;
      }
    }
    if (data.people?.length) {
      for (const p of data.people) {
        await prisma.personItem.create({ data: { userId, name: p.name, email: p.email || '', phone: p.phone || '', org: p.org || '', role: p.role || '', notes: p.notes || '', category: p.category || '' } });
        imported++;
      }
    }
    if (data.finance?.length) {
      for (const f of data.finance) {
        await prisma.financeRecord.create({ data: { userId, type: f.type, description: f.description, amount: f.amount, category: f.category || 'other', date: f.date } });
        imported++;
      }
    }

    await logActivity(userId, 'import', 'system', `Imported ${imported} items`);
    res.json(formatApiResponse({ imported }));
  } catch (err) { next(err); }
});

export default router;
