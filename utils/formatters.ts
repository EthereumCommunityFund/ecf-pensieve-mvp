/**
 * Utility functions for formatting data
 */

import dayjs from '@/lib/dayjs';

/**
 * Format a number to a more readable format
 *
 * Examples:
 * - 1234 -> "1.2k"
 * - 1000000 -> "1.0m"
 * - 1500 -> "1.5k"
 * - 999 -> "999"
 *
 * @param num - The number to format
 * @param options - Optional configuration
 * @returns Formatted number string
 */
export function formatNumber(
  num: number | null | undefined,
  options: {
    /** Number of decimal places to show (default: 1) */
    decimals?: number;
    /** Return this value when input is invalid (default: "0") */
    fallback?: string;
  } = {},
): string {
  // Set default options
  const { decimals = 1, fallback = '0' } = options;

  // Handle invalid inputs
  if (num === null || num === undefined || isNaN(num)) {
    return fallback;
  }

  // Handle negative numbers
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Format based on magnitude
  let formatted: string;

  if (absNum >= 1000000) {
    // Millions (1,000,000+) -> 1.0m
    formatted = `${(absNum / 1000000).toFixed(decimals)}m`;
  } else if (absNum >= 1000) {
    // Thousands (1,000+) -> 1.0k
    formatted = `${(absNum / 1000).toFixed(decimals)}k`;
  } else {
    // Regular numbers (0-999)
    formatted = absNum.toString();
  }

  // Remove trailing zeros after decimal point
  formatted = formatted.replace(/\.0+([km]?)$/, '$1');

  // Add negative sign if needed
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format a date to a readable string format
 *
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format to use (default: 'MM/DD/YYYY')
 * @param fallback - The fallback value if date is invalid (default: '')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: string = 'MM/DD/YYYY',
  fallback: string = '',
): string {
  if (!date) return fallback;

  try {
    return dayjs(date).format(format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
}
