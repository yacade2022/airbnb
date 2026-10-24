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

// ---- Booking calendar ----
// The calendar works with YYYY-MM-DD strings, which compare correctly as plain strings
// and avoid time zone shifts between the server's UTC dates and the visitor's local dates

// A booked stay; checkOut is exclusive, so that day is free for the next guest to check in
export type BookedStay = { checkIn: string; checkOut: string };

// A local calendar date (as the date picker uses) as YYYY-MM-DD
export const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// YYYY-MM-DD as a local calendar date, for the date picker
export function fromDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Whether someone is already staying the night that starts on `day`
export const isNightBooked = (day: string, stays: BookedStay[]) =>
  stays.some((stay) => stay.checkIn <= day && day < stay.checkOut);

// The latest check-out for a stay starting on checkIn: the next booked night (checking out
// the day someone else checks in is fine), capped at MAX_NIGHTS
export function latestCheckOut(checkIn: string, stays: BookedStay[]) {
  const limit = addDays(parseDateInput(checkIn)!, MAX_NIGHTS).toISOString().slice(0, 10);
  return stays.reduce(
    (latest, stay) => (stay.checkIn > checkIn && stay.checkIn < latest ? stay.checkIn : latest),
    limit
  );
}

// Same rule as the server's overlap check: each stay starts before the other ends
export const overlapsBookedStay = (checkIn: string, checkOut: string, stays: BookedStay[]) =>
  stays.some((stay) => stay.checkIn < checkOut && checkIn < stay.checkOut);
