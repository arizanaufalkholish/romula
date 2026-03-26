import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function timeAgo(dateString: string): string {
  if (!dateString) return '';
  const d = (Date.now() - new Date(dateString).getTime()) / 1000;
  if (d < 60) return 'Baru saja';
  if (d < 3600) return Math.floor(d / 60) + 'm lalu';
  if (d < 86400) return Math.floor(d / 3600) + 'j lalu';
  if (d < 2592000) return Math.floor(d / 86400) + 'hr lalu';
  return formatDate(dateString);
}

export function truncate(text: string, length = 80): string {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
}
