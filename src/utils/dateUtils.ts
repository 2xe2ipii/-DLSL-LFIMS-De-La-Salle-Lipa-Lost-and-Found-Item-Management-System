import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import { Item } from '../types/item';

/**
 * DateRange interface for report date ranges
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date, formatString: string = 'MMM dd, yyyy'): string => {
  if (!date) return '';
  
  // Handle special format patterns
  if (formatString === 'MM/dd/yyyy') {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  }
  
  if (formatString === 'MMMM dd, yyyy') {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    });
  }
  
  if (formatString === 'MMMM dd, yyyy - h:mm a') {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Default format
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Format a date to MM/DD/YYYY HH:MM AM/PM
 */
export const formatDateTime = (date: Date): string => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a date range as a string
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Get the date range for a specific month and year
 */
export const getMonthDateRange = (month: number, year: number): DateRange => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  // Set to beginning of day
  startDate.setHours(0, 0, 0, 0);
  
  // Set to end of day
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

/**
 * Get the date range for a specific year
 */
export const getYearDateRange = (year: number): DateRange => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  // Set to beginning of day
  startDate.setHours(0, 0, 0, 0);
  
  // Set to end of day
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

/**
 * Get the date range for the last N months
 */
export const getLastMonthsDateRange = (months: number): DateRange => {
  const endDate = new Date();
  const startDate = new Date();
  
  startDate.setMonth(startDate.getMonth() - months);
  
  // Set to beginning of day
  startDate.setHours(0, 0, 0, 0);
  
  // Set to end of day
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

/**
 * Get months list for dropdowns
 */
export const getMonthsList = (): { value: number; label: string }[] => {
  return [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];
};

/**
 * Get years list for dropdowns
 */
export const getYearsList = (): { value: number; label: string }[] => {
  const currentYear = new Date().getFullYear();
  const years: { value: number; label: string }[] = [];
  
  // Include current year and 4 previous years
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    years.push({ value: year, label: year.toString() });
  }
  
  return years;
};

/**
 * Calculate the age of a date in days
 */
export const getAgeInDays = (date: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Get date range for the last 30 days
 */
export const getLast30DaysRange = (): DateRange => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  // Set times to beginning and end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

/**
 * Get date range for the current month
 */
export const getCurrentMonthRange = (): DateRange => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

/**
 * Get date range for the previous month
 */
export const getPreviousMonthRange = (): DateRange => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

/**
 * Get date range for the current year
 */
export const getCurrentYearRange = (): DateRange => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  const endDate = new Date(now.getFullYear(), 11, 31);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

/**
 * Check if a date is within a date range
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * Parse a date string safely
 */
export const parseDate = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
};

/**
 * Check if an item is older than the specified number of days
 */
export const isItemOlderThanDays = (date: Date | string | undefined, days: number): boolean => {
  if (!date) return false;
  
  const itemDate = new Date(date);
  if (isNaN(itemDate.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const diffTime = Math.abs(today.getTime() - itemDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > days;
};

/**
 * Create a DateRange object from start and end dates
 */
export const createDateRange = (startDate: Date | null, endDate: Date | null): DateRange | null => {
  if (!startDate || !endDate) return null;
  return { startDate, endDate };
}; 