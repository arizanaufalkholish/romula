import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { createCrudRoutes } from './routes/crud';
import prisma from './config/db';

// Route imports
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import analyticsRoutes from './routes/analytics';

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// --- Auth routes ---
app.use('/api/auth', authRoutes);

// --- File routes (custom, with multer) ---
app.use('/api/files', fileRoutes);

// --- CRUD routes using generic factory ---
app.use('/api/tables', createCrudRoutes('tables', prisma.tableItem, {
  createFields: ['name', 'columns', 'rows', 'category'],
  updateFields: ['name', 'columns', 'rows', 'category', 'isFavorite', 'isArchived'],
  searchFields: ['name'],
}));

app.use('/api/people', createCrudRoutes('people', prisma.personItem, {
  createFields: ['name', 'email', 'phone', 'org', 'role', 'notes', 'category'],
  updateFields: ['name', 'email', 'phone', 'org', 'role', 'notes', 'category', 'isFavorite', 'isArchived'],
  searchFields: ['name', 'email', 'org', 'notes'],
}));

app.use('/api/sql', createCrudRoutes('sql', prisma.sqlItem, {
  createFields: ['name', 'query', 'result', 'description', 'category'],
  updateFields: ['name', 'query', 'result', 'description', 'category', 'isFavorite', 'isArchived'],
  searchFields: ['name', 'query', 'description'],
}));

app.use('/api/code', createCrudRoutes('code', prisma.codeSnippet, {
  createFields: ['name', 'code', 'language', 'description', 'category'],
  updateFields: ['name', 'code', 'language', 'description', 'category', 'isFavorite', 'isArchived'],
  searchFields: ['name', 'code', 'description'],
}));

app.use('/api/notes', createCrudRoutes('notes', prisma.noteItem, {
  createFields: ['title', 'content', 'summary', 'category'],
  updateFields: ['title', 'content', 'summary', 'category', 'isFavorite', 'isArchived'],
  searchFields: ['title', 'content', 'summary'],
}));

app.use('/api/news', createCrudRoutes('news', prisma.newsItem, {
  createFields: ['title', 'content', 'source', 'link', 'category', 'isRead'],
  updateFields: ['title', 'content', 'source', 'link', 'category', 'isRead', 'isFavorite', 'isArchived'],
  searchFields: ['title', 'content', 'source'],
}));

app.use('/api/finance', createCrudRoutes('finance', prisma.financeRecord, {
  createFields: ['type', 'description', 'amount', 'category', 'date'],
  updateFields: ['type', 'description', 'amount', 'category', 'date', 'isFavorite', 'isArchived'],
  searchFields: ['description', 'category'],
}));

app.use('/api/tags', createCrudRoutes('tags', prisma.tag, {
  createFields: ['name', 'color'],
  updateFields: ['name', 'color'],
  searchFields: ['name'],
}));

app.use('/api/categories', createCrudRoutes('categories', prisma.category, {
  createFields: ['name', 'module', 'color'],
  updateFields: ['name', 'module', 'color'],
  searchFields: ['name'],
}));

app.use('/api/bookmarks', createCrudRoutes('bookmarks', prisma.bookmark, {
  createFields: ['title', 'url', 'description', 'category'],
  updateFields: ['title', 'url', 'description', 'category', 'isFavorite'],
  searchFields: ['title', 'url', 'description'],
}));

// --- Analytics, Search, Activities, Export ---
app.use('/api', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ROMULA API', version: '1.0.0' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`\n🚀 ROMULA API running at http://localhost:${config.port}`);
  console.log(`   Health: http://localhost:${config.port}/api/health\n`);
});

export default app;
