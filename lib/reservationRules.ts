// Shared by the booking form (live total, input limits) and utils/actions.ts (server validation)

export const MAX_GUESTS = 16;
export const MAX_NIGHTS = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

// Parses an <input type="date"> value (YYYY-MM-DD) as UTC midnight, matching how @db.Date is stored.
// Returns undefined for anything else, including impossible dates like 2026-02-30
export function parseDateInput(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) ? date : undefined;
}

export const nightsBetween = (checkIn: Date, checkOut: Date) =>
  Math.round((checkOut.getTime() - checkIn.getTime()) / DAY_MS);

export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

// Today as YYYY-MM-DD in the viewer's own time zone, for the date inputs' min attribute
export function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 10);
}
