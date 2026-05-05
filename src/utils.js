/**
 * utils.js
 * Shared date utility functions.
 */

const DE_MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

/** Parse an ISO date string to a local-noon Date to avoid timezone shifts. */
export function parseDate(isoStr) {
  return new Date(isoStr + 'T12:00:00');
}

/** Convert a Date to an ISO date string. */
export function toISO(date) {
  return date.toISOString().split('T')[0];
}

/** Add n days to an ISO date string. Returns ISO string. */
export function addDays(isoStrOrDate, n) {
  const d = typeof isoStrOrDate === 'string' ? parseDate(isoStrOrDate) : new Date(isoStrOrDate);
  d.setDate(d.getDate() + n);
  return d;
}

/** Day-of-week for an ISO date string (0=Sun … 6=Sat). */
export function dowOf(isoStr) {
  return parseDate(isoStr).getDay();
}

/** ISO date of the Monday of the week containing the given ISO date. */
export function weekMondayOf(isoStr) {
  const d = parseDate(isoStr);
  const diff = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - diff);
  return toISO(d);
}

/** Format an ISO date as DD.MM.YYYY */
export function fmtDate(isoStr) {
  if (!isoStr) return '';
  const d = parseDate(isoStr);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

/** Format an ISO date as "5. Juni" */
export function fmtShort(isoStr) {
  const d = parseDate(isoStr);
  return `${d.getDate()}. ${DE_MONTHS[d.getMonth()]}`;
}

/** Format a time range from two HH:MM strings. */
export function fmtTimeRange(start, end) {
  return `${start || '?'} – ${end || '?'} Uhr`;
}
