import { z } from 'zod';

// Base Zod schemas for shared validation between frontend and backend

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const NoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  summary: z.string().optional(),
  category: z.string().optional(),
});

export const FinanceSchema = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  category: z.string(),
  date: z.string(),
});
