/**
 * Utility functions for formatting data
 */

import { DateValue, parseDate } from '@internationalized/date';

import dayjs from '@/lib/dayjs';
import { IDateConstraints } from '@/types/item';

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
 * @param useUTC - Whether to format in UTC timezone (default: false, uses local timezone)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: string = 'MM/DD/YYYY',
  fallback: string = '',
  useUTC: boolean = false,
): string {
  if (!date) return fallback;

  try {
    // Use UTC or local timezone based on useUTC parameter
    return useUTC
      ? dayjs(date).utc().format(format)
      : dayjs(date).format(format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
}

/**
 * Format a date to a readable string format with timezone
 *
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format to use (default: 'MM/DD/YYYY HH:mm')
 * @param fallback - The fallback value if date is invalid (default: '')
 * @returns Formatted date string with timezone info
 */
export function formatDateWithTime(
  date: Date | string | null | undefined,
  format: string = 'MM/DD/YYYY HH:mm',
  fallback: string = '',
): string {
  if (!date) return fallback;

  try {
    // Display in local timezone
    return dayjs(date).format(format);
  } catch (error) {
    console.error('Error formatting date with time:', error);
    return fallback;
  }
}

/**
 * Format a date to a readable string format in GMT timezone
 *
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format to use (default: 'MM/DD/YYYY HH:mm')
 * @param fallback - The fallback value if date is invalid (default: '')
 * @returns Formatted date string in GMT timezone
 */
export function formatDateWithTimeGMT(
  date: Date | string | null | undefined,
  format: string = 'MM/DD/YYYY HH:mm',
  fallback: string = '',
): string {
  if (!date) return fallback;

  try {
    // Display in GMT timezone
    return dayjs(date).utc().format(format);
  } catch (error) {
    console.error('Error formatting date with time in GMT:', error);
    return fallback;
  }
}

/**
 * Format a date to a readable string format in UTC timezone (no conversion)
 * This is useful for displaying dates exactly as stored in the database
 *
 * @param date - The date to format (Date object or ISO string)
 * @param format - The format to use (default: 'MM/DD/YYYY')
 * @param fallback - The fallback value if date is invalid (default: '')
 * @returns Formatted date string in UTC timezone
 */
export function formatDateAsUTC(
  date: Date | string | null | undefined,
  format: string = 'MM/DD/YYYY',
  fallback: string = '',
): string {
  if (!date) return fallback;

  try {
    // Always display in UTC timezone
    return dayjs(date).utc().format(format);
  } catch (error) {
    console.error('Error formatting date as UTC:', error);
    return fallback;
  }
}

/**
 * Convert a JavaScript Date to DateValue for DatePicker component
 *
 * @param date - JavaScript Date object or null/undefined
 * @returns DateValue representing the date in UTC (no timezone conversion)
 *
 * @important This function treats the date as UTC to ensure consistent display
 * across all timezones. The returned DateValue represents a calendar date
 * without any timezone information, ensuring all users see the same date.
 */
export const dateToDateValue = (
  date: Date | null | undefined,
): DateValue | null => {
  if (!date) return null;
  try {
    // Use UTC to ensure consistent date display across timezones
    const dateString = dayjs(date).utc().format('YYYY-MM-DD');
    return parseDate(dateString);
  } catch (e) {
    console.error('Error parsing date for DatePicker:', date, e);
    return null;
  }
};

/**
 * Convert a DateValue from DatePicker to JavaScript Date
 *
 * @param dateValue - DateValue from DatePicker component or null
 * @returns JavaScript Date object at UTC midnight (00:00:00Z)
 *
 * @important This function returns a Date object representing the start of the day
 * in UTC (00:00:00Z). This ensures consistent storage and prevents timezone shifts.
 * The returned Date should always be used with UTC formatting functions to maintain
 * consistency. For storage, this Date can be directly serialized to ISO string.
 *
 * @example
 * const dateValue = parseDate('2024-01-15');
 * const date = dateValueToDate(dateValue); // Returns Date at 2024-01-15T00:00:00.000Z
 * // For display: use dayjs.utc(date).format('YYYY-MM-DD')
 * // For storage: use date.toISOString()
 */
export const dateValueToDate = (dateValue: DateValue | null): Date | null => {
  if (!dateValue) return null;
  try {
    // Use UTC to ensure consistent date handling across timezones
    // This creates a Date at UTC midnight (00:00:00Z)
    return dayjs.utc(dateValue.toString()).toDate();
  } catch (e) {
    console.error('Error converting DateValue to Date:', dateValue, e);
    return null;
  }
};

export const processDateConstraints = (constraints: IDateConstraints) => {
  const today = new Date();

  const parseConstraintDate = (
    dateValue: Date | string | 'today' | 'yesterday' | 'tomorrow',
  ): Date | null => {
    if (!dateValue) return null;

    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }

    if (typeof dateValue === 'string') {
      switch (dateValue) {
        case 'today':
          return today;
        case 'yesterday':
          return dayjs(today).subtract(1, 'day').toDate();
        case 'tomorrow':
          return dayjs(today).add(1, 'day').toDate();
        default:
          const parsed = dayjs(dateValue);
          if (!parsed.isValid()) {
            console.warn(`Invalid date constraint: ${dateValue}`);
            return null;
          }
          return parsed.toDate();
      }
    }

    return null;
  };

  const result: {
    minValue?: DateValue;
    maxValue?: DateValue;
    isDateUnavailable?: (date: DateValue) => boolean;
  } = {};

  // Handle minimum date
  if (constraints.minDate) {
    const minDate = parseConstraintDate(constraints.minDate);
    if (minDate) {
      // Use UTC to ensure consistent date boundaries across timezones
      result.minValue = parseDate(dayjs(minDate).utc().format('YYYY-MM-DD'));
    }
  }

  // Handle minimum date relative to today
  if (constraints.relativeToToday?.minDaysFromToday !== undefined) {
    const minDate = dayjs(today)
      .add(constraints.relativeToToday.minDaysFromToday, 'day')
      .toDate();
    // Use UTC to ensure consistent date boundaries across timezones
    const minDateValue = parseDate(dayjs(minDate).utc().format('YYYY-MM-DD'));
    // Choose the stricter minimum date constraint (later date)
    if (
      !result.minValue ||
      dayjs(minDateValue.toString()).isAfter(dayjs(result.minValue.toString()))
    ) {
      result.minValue = minDateValue;
    }
  }

  // Handle maximum date
  if (constraints.maxDate) {
    const maxDate = parseConstraintDate(constraints.maxDate);
    if (maxDate) {
      // Use UTC to ensure consistent date boundaries across timezones
      result.maxValue = parseDate(dayjs(maxDate).utc().format('YYYY-MM-DD'));
    }
  }

  // Handle maximum date relative to today
  if (constraints.relativeToToday?.maxDaysFromToday !== undefined) {
    const maxDate = dayjs(today)
      .add(constraints.relativeToToday.maxDaysFromToday, 'day')
      .toDate();
    // Use UTC to ensure consistent date boundaries across timezones
    const maxDateValue = parseDate(dayjs(maxDate).utc().format('YYYY-MM-DD'));
    // Choose the stricter maximum date constraint (earlier date)
    if (
      !result.maxValue ||
      dayjs(maxDateValue.toString()).isBefore(dayjs(result.maxValue.toString()))
    ) {
      result.maxValue = maxDateValue;
    }
  }

  // Handle year range
  if (constraints.yearRange) {
    const { min: minYear, max: maxYear } = constraints.yearRange;
    if (minYear) {
      const yearMinDate = parseDate(`${minYear}-01-01`);
      // Choose the stricter minimum date constraint (later date)
      if (
        !result.minValue ||
        dayjs(yearMinDate.toString()).isAfter(dayjs(result.minValue.toString()))
      ) {
        result.minValue = yearMinDate;
      }
    }
    if (maxYear) {
      const yearMaxDate = parseDate(`${maxYear}-12-31`);
      // Choose the stricter maximum date constraint (earlier date)
      if (
        !result.maxValue ||
        dayjs(yearMaxDate.toString()).isBefore(
          dayjs(result.maxValue.toString()),
        )
      ) {
        result.maxValue = yearMaxDate;
      }
    }
  }

  // Handle disabled dates and other constraints
  if (
    constraints.disabledDates ||
    constraints.disabledDaysOfWeek ||
    constraints.enabledDateRanges
  ) {
    result.isDateUnavailable = (date: DateValue) => {
      const dateObj = dayjs(date.toString()).toDate();

      // Check disabled specific dates
      if (constraints.disabledDates) {
        const isDisabled = constraints.disabledDates.some(
          (disabledDate: Date | string) => {
            const parsedDisabledDate = parseConstraintDate(disabledDate);
            return (
              parsedDisabledDate &&
              dayjs(dateObj).isSame(dayjs(parsedDisabledDate), 'day')
            );
          },
        );
        if (isDisabled) return true;
      }

      // Check disabled days of week
      if (constraints.disabledDaysOfWeek) {
        const dayOfWeek = dateObj.getDay();
        if (constraints.disabledDaysOfWeek.includes(dayOfWeek)) {
          return true;
        }
      }

      // Check allowed date ranges (if set, only dates within ranges are available)
      if (
        constraints.enabledDateRanges &&
        constraints.enabledDateRanges.length > 0
      ) {
        const isInEnabledRange = constraints.enabledDateRanges.some(
          (range: { start: Date | string; end: Date | string }) => {
            const startDate = parseConstraintDate(range.start);
            const endDate = parseConstraintDate(range.end);
            if (!startDate || !endDate) return false;

            const targetDate = dayjs(dateObj);
            const rangeStart = dayjs(startDate);
            const rangeEnd = dayjs(endDate);

            // Check if date is within range (inclusive of boundaries)
            return (
              (targetDate.isAfter(rangeStart, 'day') ||
                targetDate.isSame(rangeStart, 'day')) &&
              (targetDate.isBefore(rangeEnd, 'day') ||
                targetDate.isSame(rangeEnd, 'day'))
            );
          },
        );
        return !isInEnabledRange;
      }

      return false;
    };
  }

  // Validate that minimum date should not be greater than maximum date
  if (result.minValue && result.maxValue) {
    const minDate = dayjs(result.minValue.toString());
    const maxDate = dayjs(result.maxValue.toString());

    if (minDate.isAfter(maxDate)) {
      console.warn(
        'Date constraint conflict: minDate is after maxDate, using maxDate as minDate',
      );
      result.minValue = result.maxValue;
    }
  }

  return result;
};

/**
 * Build DatePicker props from date constraints configuration
 * This function combines constraint processing with prop building for easier component usage
 *
 * @param constraints - Date constraints configuration or undefined
 * @returns Ready-to-use props object for DatePicker component
 *
 * @example
 * // Basic usage in a component
 * const dateProps = buildDatePickerProps(itemConfig.dateConstraints);
 * return <DatePicker {...dateProps} value={dateValue} onChange={handleChange} />;
 *
 * @example
 * // With specific constraints
 * const constraints = {
 *   maxDate: 'today',
 *   disabledDaysOfWeek: [0, 6] // Disable weekends
 * };
 * const dateProps = buildDatePickerProps(constraints);
 */
export const buildDatePickerProps = (constraints?: IDateConstraints) => {
  const dateConstraintProps: Record<string, any> = {};

  if (constraints) {
    const processedConstraints = processDateConstraints(constraints);

    if (processedConstraints.minValue) {
      dateConstraintProps.minValue = processedConstraints.minValue;
    }
    if (processedConstraints.maxValue) {
      dateConstraintProps.maxValue = processedConstraints.maxValue;
    }
    if (processedConstraints.isDateUnavailable) {
      dateConstraintProps.isDateUnavailable =
        processedConstraints.isDateUnavailable;
    }
  }

  return dateConstraintProps;
};
