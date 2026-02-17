import type { CalendarEvent } from '@/lib/database.types';

/**
 * Escape special characters in iCalendar text values (RFC 5545)
 */
function escapeIcalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Format a Date to iCalendar UTC format: YYYYMMDDTHHMMSSZ
 */
function formatIcalDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Convert hex color (#RRGGBB) to iCalendar format (RRGGBB without #)
 */
function hexToIcalColor(hex: string): string {
  const match = hex.match(/^#?([a-fA-F0-9]{6})$/);
  return match ? match[1].toUpperCase() : '00F0FF';
}

/**
 * Generate iCalendar (.ics) format string from calendar events
 */
export function generateIcalContent(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planearn//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const startDate = new Date(event.due_date);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const uid = `${event.id}@planearn.com`;
    const summary = escapeIcalText(event.title);
    const description = event.description
      ? escapeIcalText(event.description)
      : '';
    const dtstart = formatIcalDate(startDate);
    const dtend = formatIcalDate(endDate);
    const categories = event.event_type.toUpperCase();
    const color = hexToIcalColor(event.color);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${formatIcalDate(new Date())}`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${summary}`);
    if (description) {
      lines.push(`DESCRIPTION:${description}`);
    }
    lines.push(`CATEGORIES:${categories}`);
    lines.push(`COLOR:${color}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger download of .ics file
 */
export function downloadIcalFile(events: CalendarEvent[], filename?: string): void {
  const content = generateIcalContent(events);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `planearn-calendar-${new Date().toISOString().slice(0, 10)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create a data URL for opening in native calendar app (webcal:// or data:)
 * Returns a blob URL that can be used for download fallback on unsupported platforms
 */
export function getIcalDataUrl(events: CalendarEvent[]): string {
  const content = generateIcalContent(events);
  const base64 = btoa(unescape(encodeURIComponent(content)));
  return `data:text/calendar;base64,${base64}`;
}
