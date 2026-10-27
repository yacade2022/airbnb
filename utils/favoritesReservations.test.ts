import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock calls are hoisted, so the mocks they use must be hoisted too
const { db, tx, guest, getCurrentUser, revalidatePath, redirect } = vi.hoisted(() => {
  const tx = {
    home: { findUnique: vi.fn() },
    reservation: { findFirst: vi.fn(), create: vi.fn() },
  };
  return {
    tx,
    db: {
      home: { findUnique: vi.fn() },
      favorite: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), findMany: vi.fn() },
      reservation: { deleteMany: vi.fn(), findMany: vi.fn() },
      // Runs the callback against the transaction mock, like Prisma's interactive transactions
      $transaction: vi.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    },
    guest: { getGuestId: vi.fn(), getOrCreateGuestId: vi.fn() },
    getCurrentUser: vi.fn(),
    revalidatePath: vi.fn(),
    // The real redirect() throws to stop execution; mimic that
    redirect: vi.fn(() => {
      throw new Error('NEXT_REDIRECT');
    }),
  };
});

vi.mock('./db', () => ({ default: db }));
vi.mock('@/lib/supabase', () => ({ getSupabase: vi.fn() }));
vi.mock('@/lib/guest', () => guest);
// Booking requires a logged-in user; only the session lookup is faked
vi.mock('@/lib/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/auth')>()),
  getCurrentUser,
}));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({ redirect }));

import { Prisma } from '@prisma/client';
import { cancelReservation, createReservation, fetchFavoriteIds, fetchReservations, toggleFavorite } from './actions';

const NOW = new Date('2026-10-19T12:00:00Z');

function bookingForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const fields = { homeId: 'home-1', checkIn: '2026-11-01', checkOut: '2026-11-04', guests: '2', ...overrides };
  for (const [key, value] of Object.entries(fields)) formData.append(key, value);
  return formData;
}

const book = (overrides?: Record<string, string>) => createReservation({}, bookingForm(overrides));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
  getCurrentUser.mockResolvedValue({ id: 'user-1', name: 'Ana', email: 'ana@example.com', role: 'USER' });
  guest.getGuestId.mockResolvedValue('guest-1');
  guest.getOrCreateGuestId.mockResolvedValue('guest-1');
  db.home.findUnique.mockResolvedValue({ id: 'home-1' });
  tx.home.findUnique.mockResolvedValue({ price: 120 });
  tx.reservation.findFirst.mockResolvedValue(null);
  tx.reservation.create.mockResolvedValue({ id: 'res-1' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('toggleFavorite', () => {
  it('adds a home that is not a favorite yet', async () => {
    db.favorite.findUnique.mockResolvedValue(null);
    await toggleFavorite('home-1');
    expect(db.favorite.create).toHaveBeenCalledWith({ data: { guestId: 'guest-1', homeId: 'home-1' } });
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('removes a home that is already a favorite', async () => {
    db.favorite.findUnique.mockResolvedValue({ id: 'fav-1' });
    await toggleFavorite('home-1');
    expect(db.favorite.delete).toHaveBeenCalledWith({ where: { guestId_homeId: { guestId: 'guest-1', homeId: 'home-1' } } });
    expect(db.favorite.create).not.toHaveBeenCalled();
  });

  it('ignores homes that do not exist', async () => {
    db.favorite.findUnique.mockResolvedValue(null);
    db.home.findUnique.mockResolvedValue(null);
    await toggleFavorite('missing');
    expect(db.favorite.create).not.toHaveBeenCalled();
  });

  it('treats a duplicate from a double click as success', async () => {
    db.favorite.findUnique.mockResolvedValue(null);
    db.favorite.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'test' })
    );
    await expect(toggleFavorite('home-1')).resolves.toBeUndefined();
  });
});

describe('fetchFavoriteIds', () => {
  it('returns an empty set without querying when the visitor has no guest cookie', async () => {
    guest.getGuestId.mockResolvedValue(undefined);
    expect((await fetchFavoriteIds()).size).toBe(0);
    expect(db.favorite.findMany).not.toHaveBeenCalled();
  });

  it("returns the visitor's favorite home ids", async () => {
    db.favorite.findMany.mockResolvedValue([{ homeId: 'home-1' }, { homeId: 'home-2' }]);
    expect([...(await fetchFavoriteIds())]).toEqual(['home-1', 'home-2']);
    expect(db.favorite.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { guestId: 'guest-1' } }));
  });
});

describe('createReservation', () => {
  it('sends logged-out visitors to log in, keeping their dates, and books nothing', async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(book()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith(
      '/login?next=' + encodeURIComponent('/homes/home-1?checkIn=2026-11-01&checkOut=2026-11-04&guests=2')
    );
    expect(tx.reservation.create).not.toHaveBeenCalled();
  });

  it('saves the booking with nights x price and redirects to the reservations page', async () => {
    await expect(book()).rejects.toThrow('NEXT_REDIRECT');
    expect(tx.reservation.create).toHaveBeenCalledWith({
      data: {
        guestId: 'guest-1',
        homeId: 'home-1',
        checkIn: new Date('2026-11-01T00:00:00Z'),
        checkOut: new Date('2026-11-04T00:00:00Z'),
        guests: 2,
        totalPrice: 360,
      },
    });
    expect(redirect).toHaveBeenCalledWith('/reservations?booked=res-1');
  });

  it('checks for overlapping stays on the same home', async () => {
    await expect(book()).rejects.toThrow('NEXT_REDIRECT');
    expect(tx.reservation.findFirst).toHaveBeenCalledWith({
      where: {
        homeId: 'home-1',
        checkIn: { lt: new Date('2026-11-04T00:00:00Z') },
        checkOut: { gt: new Date('2026-11-01T00:00:00Z') },
      },
      select: { id: true },
    });
  });

  it('rejects a home id that does not exist (the hidden field can be edited)', async () => {
    tx.home.findUnique.mockResolvedValue(null);
    const state = await book({ homeId: 'missing' });
    expect(state.error).toMatch(/no longer available/);
    expect(tx.reservation.create).not.toHaveBeenCalled();
  });

  it('rejects dates that are already booked', async () => {
    tx.reservation.findFirst.mockResolvedValue({ id: 'other' });
    const state = await book();
    expect(state.error).toMatch(/already booked/);
    expect(tx.reservation.create).not.toHaveBeenCalled();
    // The listing page is refreshed so its calendar shows the booking that got in first
    expect(revalidatePath).toHaveBeenCalledWith('/homes/home-1');
  });

  const serializationFailure = () =>
    new Prisma.PrismaClientKnownRequestError('could not serialize access', { code: 'P2034', clientVersion: 'test' });

  it('retries when a concurrent booking aborts the transaction, then sees the other booking', async () => {
    db.$transaction.mockRejectedValueOnce(serializationFailure());
    tx.reservation.findFirst.mockResolvedValue({ id: 'other' });
    const state = await book();
    expect(db.$transaction).toHaveBeenCalledTimes(2);
    expect(state.error).toMatch(/already booked/);
    expect(tx.reservation.create).not.toHaveBeenCalled();
  });

  it('books on retry when the concurrent booking did not overlap', async () => {
    db.$transaction.mockRejectedValueOnce(serializationFailure());
    await expect(book()).rejects.toThrow('NEXT_REDIRECT');
    expect(db.$transaction).toHaveBeenCalledTimes(2);
  });

  it('gives up after repeated conflicts', async () => {
    db.$transaction
      .mockRejectedValueOnce(serializationFailure())
      .mockRejectedValueOnce(serializationFailure())
      .mockRejectedValueOnce(serializationFailure());
    const state = await book();
    expect(db.$transaction).toHaveBeenCalledTimes(3);
    expect(state.error).toMatch(/Something went wrong/);
  });

  it.each([
    [{ checkIn: '' }, 'checkIn', /check-in date/],
    [{ checkIn: '2026-02-30' }, 'checkIn', /check-in date/],
    [{ checkIn: '2026-10-01' }, 'checkIn', /past/],
    [{ checkOut: '' }, 'checkOut', /check-out date/],
    [{ checkOut: '2026-11-01' }, 'checkOut', /after check-in/],
    [{ checkOut: '2027-01-15' }, 'checkOut', /at most 60 nights/],
    [{ guests: '0' }, 'guests', /1 to 16/],
    [{ guests: '17' }, 'guests', /1 to 16/],
    [{ guests: '1.5' }, 'guests', /1 to 16/],
  ])('rejects %o', async (overrides, field, message) => {
    const state = await book(overrides);
    expect(state.field).toBe(field);
    expect(state.error).toMatch(message);
    expect(state.values).toMatchObject(overrides);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('accepts a check-in one day behind the server date (visitor time zones)', async () => {
    await expect(book({ checkIn: '2026-10-18', checkOut: '2026-10-20' })).rejects.toThrow('NEXT_REDIRECT');
  });

  it('returns an error instead of throwing when the database fails', async () => {
    db.$transaction.mockRejectedValueOnce(new Error('connection lost'));
    const state = await book();
    expect(state.error).toMatch(/Something went wrong/);
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('cancelReservation', () => {
  it("only deletes the visitor's own reservation", async () => {
    db.reservation.deleteMany.mockResolvedValue({ count: 1 });
    await cancelReservation('res-1');
    expect(db.reservation.deleteMany).toHaveBeenCalledWith({ where: { id: 'res-1', guestId: 'guest-1' } });
  });

  it('does nothing without a guest cookie', async () => {
    guest.getGuestId.mockResolvedValue(undefined);
    await cancelReservation('res-1');
    expect(db.reservation.deleteMany).not.toHaveBeenCalled();
  });
});

describe('fetchReservations', () => {
  it('returns nothing without a guest cookie', async () => {
    guest.getGuestId.mockResolvedValue(undefined);
    expect(await fetchReservations()).toEqual([]);
    expect(db.reservation.findMany).not.toHaveBeenCalled();
  });
});
