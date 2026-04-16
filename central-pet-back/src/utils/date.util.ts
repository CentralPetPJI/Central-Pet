export function toISO(date?: string | Date): string {
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string' && date) return date;
  return new Date().toISOString();
}
