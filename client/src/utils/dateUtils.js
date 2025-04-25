import { format } from 'date-fns';

/**
 * Format a date using date-fns
 * @param {Date} date - The date to format
 * @param {string} formatStr - The format string (default: 'MMM dd, yyyy')
 * @returns {string} The formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Get the start and end dates for a calendar view
 * @param {Date} date - The current date
 * @param {string} view - The calendar view type ('month', 'week', 'day')
 * @returns {Object} Object with start and end dates
 */
export const getCalendarRange = (date, view) => {
  // Implementation can be added based on project needs
  return { start: date, end: date };
}; 