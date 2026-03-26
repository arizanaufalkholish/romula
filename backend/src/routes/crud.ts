import { Router, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { formatApiResponse, logActivity, getUserId } from '../utils/helpers';

// Generic CRUD route factory for simple models
export function createCrudRoutes(
  modelName: string,
  prismaModel: any,
  options: {
    createFields: string[];
    updateFields: string[];
    searchFields?: string[];
    include?: any;
  }
) {
  const router = Router();
  router.use(authMiddleware);

  // GET all
  router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const { search, category, favorite, archived, tag, limit, offset, sortBy, sortOrder } = req.query;
      const where: any = { userId };

      if (category) where.category = category;
      if (favorite === 'true') where.isFavorite = true;
      if (archived === 'true') where.isArchived = true;
      else where.isArchived = false; // hide archived by default

      // Search across text fields
      if (search && options.searchFields) {
        where.OR = options.searchFields.map(f => ({ [f]: { contains: String(search) } }));
      }

      const items = await prismaModel.findMany({
        where,
        orderBy: { [String(sortBy || 'createdAt')]: sortOrder === 'asc' ? 'asc' : 'desc' },
        take: limit ? parseInt(String(limit)) : 50,
        skip: offset ? parseInt(String(offset)) : 0,
        ...(options.include && { include: options.include }),
      });

      const total = await prismaModel.count({ where });
      res.json(formatApiResponse({ items, total }));
    } catch (err) { next(err); }
  });

  // GET by id
  router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const item = await prismaModel.findFirst({
        where: { id: String(req.params.id), userId },
        ...(options.include && { include: options.include }),
      });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(formatApiResponse(item));
    } catch (err) { next(err); }
  });

  // POST create
  router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const data: any = { userId };
      for (const field of options.createFields) {
        if (req.body[field] !== undefined) data[field] = req.body[field];
      }
      const item = await prismaModel.create({ data });
      await logActivity(userId, 'create', modelName, data.name || data.title || data.description || modelName, item.id);
      res.status(201).json(formatApiResponse(item));
    } catch (err) { next(err); }
  });

  // PUT update
  router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const existing = await prismaModel.findFirst({ where: { id: String(req.params.id), userId } });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      const data: any = {};
      for (const field of options.updateFields) {
        if (req.body[field] !== undefined) data[field] = req.body[field];
      }
      const item = await prismaModel.update({ where: { id: String(req.params.id) }, data });
      await logActivity(userId, 'update', modelName, item.name || item.title || item.description || modelName, item.id);
      res.json(formatApiResponse(item));
    } catch (err) { next(err); }
  });

  // DELETE
  router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const existing = await prismaModel.findFirst({ where: { id: String(req.params.id), userId } });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      await prismaModel.delete({ where: { id: String(req.params.id) } });
      await logActivity(userId, 'delete', modelName, existing.name || existing.title || existing.description || modelName, String(req.params.id));
      res.json(formatApiResponse(null, 'Deleted'));
    } catch (err) { next(err); }
  });

  // PATCH toggle favorite
  router.patch('/:id/favorite', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const existing = await prismaModel.findFirst({ where: { id: String(req.params.id), userId } });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      const item = await prismaModel.update({ where: { id: String(req.params.id) }, data: { isFavorite: !existing.isFavorite } });
      res.json(formatApiResponse(item));
    } catch (err) { next(err); }
  });

  // PATCH toggle archive
  router.patch('/:id/archive', async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const existing = await prismaModel.findFirst({ where: { id: String(req.params.id), userId } });
      if (!existing) return res.status(404).json({ error: 'Not found' });
      const item = await prismaModel.update({ where: { id: String(req.params.id) }, data: { isArchived: !existing.isArchived } });
      res.json(formatApiResponse(item));
    } catch (err) { next(err); }
  });

  return router;
}
