import { format, isValid, parseISO } from 'date-fns';

export function formatDate(dateInput, pattern = 'dd MMM yyyy') {
  if (!dateInput) {
    return '-';
  }

  const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
  if (!isValid(date)) {
    return '-';
  }

  return format(date, pattern);
}

export function isTodayDate(dateInput) {
  const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}
