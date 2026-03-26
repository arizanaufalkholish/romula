import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function logActivity(userId: string, action: string, module: string, detail: string, targetId?: string) {
  await prisma.activityLog.create({
    data: { userId, action, module, detail, targetId },
  });
}

export function formatApiResponse(data: any, message?: string) {
  return { success: true, data, ...(message && { message }) };
}

export function formatApiError(error: string, status = 400) {
  const err: any = new Error(error);
  err.status = status;
  return err;
}

export function getUserId(req: AuthRequest): string {
  if (!req.userId) throw formatApiError('Unauthorized', 401);
  return req.userId;
}
