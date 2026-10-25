import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';
import type { BookingStatus, TableStatus } from './types';

// ─── Tailwind class merge helper ─────────────────────────────────────────────

/**
 * Merges Tailwind CSS classes intelligently, resolving conflicts.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Currency formatting ──────────────────────────────────────────────────────

/**
 * Formats a number as Indian Rupees (INR).
 * e.g. 1500 → "₹1,500"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a number as INR with decimal places.
 * e.g. 1500.5 → "₹1,500.50"
 */
export function formatCurrencyDecimal(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Date & Time formatting ───────────────────────────────────────────────────

/**
 * Formats an ISO date string or Date object to a human-readable date.
 * e.g. "2024-08-15" → "Thursday, 15 August 2024"
 */
export function formatDate(
  date: string | Date,
  fmt = 'EEEE, d MMMM yyyy'
): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return 'Invalid date';
    return format(d, fmt);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Formats an ISO date string to a short date.
 * e.g. "2024-08-15" → "15 Aug 2024"
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'd MMM yyyy');
}

/**
 * Formats a time string (HH:mm or HH:mm:ss) to 12-hour format.
 * e.g. "19:00" → "7:00 PM"
 */
export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return format(date, 'h:mm a');
  } catch {
    return time;
  }
}

/**
 * Formats an ISO datetime string to both date and time.
 * e.g. "2024-08-15T19:00:00" → "15 Aug 2024 at 7:00 PM"
 */
export function formatDateTime(datetime: string | Date): string {
  try {
    const d = typeof datetime === 'string' ? parseISO(datetime) : datetime;
    if (!isValid(d)) return 'Invalid date';
    return format(d, "d MMM yyyy 'at' h:mm a");
  } catch {
    return 'Invalid date';
  }
}

// ─── Booking reference generator ──────────────────────────────────────────────

/**
 * Generates a booking reference string in the format RR-YYYYMMDD-XXXX.
 * e.g. "RR-20240815-A3K9"
 */
export function generateBookingRef(): string {
  const datePart = format(new Date(), 'yyyyMMdd');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RR-${datePart}-${random}`;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

/**
 * Returns Tailwind color classes for a booking status badge.
 */
export function getBookingStatusColor(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    no_show: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}

/**
 * Returns a human-readable label for a booking status.
 */
export function getBookingStatusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No Show',
  };
  return map[status] ?? status;
}

/**
 * Returns Tailwind color classes for a table status indicator.
 */
export function getTableStatusColor(status: TableStatus): string {
  const map: Record<TableStatus, string> = {
    available: 'bg-status-available',
    booked: 'bg-status-booked',
    waiting: 'bg-status-waiting',
    reserved: 'bg-status-reserved',
  };
  return map[status] ?? 'bg-gray-400';
}

/**
 * Returns a human-readable label for a table status.
 */
export function getTableStatusLabel(status: TableStatus): string {
  const map: Record<TableStatus, string> = {
    available: 'Available',
    booked: 'Booked',
    waiting: 'Waiting',
    reserved: 'Reserved',
  };
  return map[status] ?? status;
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

/**
 * Truncates text to a given length, adding "…" if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Returns a pluralized string based on count.
 * e.g. pluralize(1, 'guest') → "1 guest"
 *      pluralize(3, 'guest') → "3 guests"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  return `${count} ${count === 1 ? singular : (plural ?? singular + 's')}`;
}

/**
 * Converts a spice level number to a label.
 */
export function spiceLevelLabel(level: 0 | 1 | 2 | 3): string {
  const labels = ['None', 'Mild', 'Medium', 'Hot'];
  return labels[level] ?? 'Unknown';
}

/**
 * Delays execution for a given number of milliseconds (useful for testing).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
