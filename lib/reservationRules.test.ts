import { describe, expect, it } from 'vitest';
import {
  fromDateInput,
  isNightBooked,
  latestCheckOut,
  overlapsBookedStay,
  toDateInput,
  type BookedStay,
} from './reservationRules';

// Nov 10-13 (3 nights) and Nov 20-22 (2 nights)
const stays: BookedStay[] = [
  { checkIn: '2026-11-10', checkOut: '2026-11-13' },
  { checkIn: '2026-11-20', checkOut: '2026-11-22' },
];

describe('toDateInput / fromDateInput', () => {
  it('round-trips local calendar dates without shifting the day', () => {
    expect(toDateInput(fromDateInput('2026-03-08'))).toBe('2026-03-08');
    expect(toDateInput(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('isNightBooked', () => {
  it.each([
    ['2026-11-09', false],
    ['2026-11-10', true],
    ['2026-11-12', true],
    // Check-out day is free for the next guest to check in
    ['2026-11-13', false],
    ['2026-11-21', true],
  ])('%s booked: %s', (day, booked) => {
    expect(isNightBooked(day, stays)).toBe(booked);
  });
});

describe('latestCheckOut', () => {
  it('stops at the next booked stay, so a guest can check out the day another checks in', () => {
    expect(latestCheckOut('2026-11-05', stays)).toBe('2026-11-10');
    expect(latestCheckOut('2026-11-13', stays)).toBe('2026-11-20');
  });

  it('is capped at the maximum stay length when nothing is booked after check-in', () => {
    expect(latestCheckOut('2026-11-22', stays)).toBe('2027-01-21');
    expect(latestCheckOut('2026-11-05', [])).toBe('2027-01-04');
  });
});

describe('overlapsBookedStay', () => {
  it.each([
    ['2026-11-05', '2026-11-10', false],
    ['2026-11-13', '2026-11-20', false],
    ['2026-11-05', '2026-11-11', true],
    ['2026-11-11', '2026-11-12', true],
    // Spanning a whole booked stay is an overlap too
    ['2026-11-01', '2026-11-30', true],
  ])('%s to %s overlaps: %s', (checkIn, checkOut, overlaps) => {
    expect(overlapsBookedStay(checkIn, checkOut, stays)).toBe(overlaps);
  });
});
