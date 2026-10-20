import { cookies } from 'next/headers';

// Anonymous visitor id used to own favorites and reservations until accounts exist.
// httpOnly so page scripts can't read or change it; a random UUID can't be guessed
const GUEST_COOKIE = 'guest_id';
const ONE_YEAR = 60 * 60 * 24 * 365;

// Read-only, so it also works in server components (which can't set cookies)
export async function getGuestId() {
  return (await cookies()).get(GUEST_COOKIE)?.value;
}

// Only call from server actions: creates the cookie on a visitor's first favorite or booking
export async function getOrCreateGuestId() {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  store.set(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_YEAR,
  });
  return id;
}
