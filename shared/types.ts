// Shared Types between ROMULA Frontend and Backend

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileItem {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TableItem {
  id: string;
  userId: string;
  name: string;
  columns: string; // JSON array
  rows: string; // JSON array
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  org: string;
  role: string;
  notes: string;
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SqlItem {
  id: string;
  name: string;
  query: string;
  result: string;
  description: string;
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSnippet {
  id: string;
  name: string;
  code: string;
  language: string;
  description: string;
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  link: string;
  category: string;
  isRead: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  module: string;
  detail: string;
  targetId?: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
