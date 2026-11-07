/**
 * Returns the current calendar date in Rwanda's local timezone.
 * Date-only CMS deadlines and event dates should not depend on the server's UTC day.
 */
export function getRwandaDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Kigali',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
