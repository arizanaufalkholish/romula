import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import prisma from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { formatApiResponse, logActivity, getUserId } from '../utils/helpers';
import { config } from '../config';

const router = Router();
router.use(authMiddleware);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(config.uploadDir)) fs.mkdirSync(config.uploadDir, { recursive: true });
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: config.maxFileSize } });

// GET all files
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const where: any = { userId, isArchived: false };
    if (req.query.category) where.category = req.query.category;
    if (req.query.favorite === 'true') where.isFavorite = true;
    if (req.query.search) where.OR = [{ name: { contains: String(req.query.search) } }, { originalName: { contains: String(req.query.search) } }];

    const items = await prisma.fileItem.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
    const total = await prisma.fileItem.count({ where });
    res.json(formatApiResponse({ items, total }));
  } catch (err) { next(err); }
});

// POST upload
router.post('/', upload.single('file'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const item = await prisma.fileItem.create({
      data: {
        userId, name: req.body.name || req.file.originalname, originalName: req.file.originalname,
        mimeType: req.file.mimetype, size: req.file.size, path: req.file.path,
        category: req.body.category || '',
      },
    });
    await logActivity(userId, 'create', 'files', item.name, item.id);
    res.status(201).json(formatApiResponse(item));
  } catch (err) { next(err); }
});

// GET download file (supports query token for <a> tag downloads)
router.get('/:id/download', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const item = await prisma.fileItem.findFirst({ where: { id: String(req.params.id), userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.download(item.path, item.originalName);
  } catch (err) { next(err); }
});

// DELETE
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const item = await prisma.fileItem.findFirst({ where: { id: String(req.params.id), userId } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    // Delete physical file
    if (fs.existsSync(item.path)) fs.unlinkSync(item.path);
    await prisma.fileItem.delete({ where: { id: String(req.params.id) } });
    await logActivity(userId, 'delete', 'files', item.name, String(req.params.id));
    res.json(formatApiResponse(null, 'Deleted'));
  } catch (err) { next(err); }
});

// PATCH favorite
router.patch('/:id/favorite', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const existing = await prisma.fileItem.findFirst({ where: { id: String(req.params.id), userId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const item = await prisma.fileItem.update({ where: { id: String(req.params.id) }, data: { isFavorite: !existing.isFavorite } });
    res.json(formatApiResponse(item));
  } catch (err) { next(err); }
});

// PATCH archive
router.patch('/:id/archive', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const existing = await prisma.fileItem.findFirst({ where: { id: String(req.params.id), userId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const item = await prisma.fileItem.update({ where: { id: String(req.params.id) }, data: { isArchived: !existing.isArchived } });
    res.json(formatApiResponse(item));
  } catch (err) { next(err); }
});

export default router;
