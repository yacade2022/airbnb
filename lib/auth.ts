import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import db from '@/utils/db';
import { loginPath } from './authRules';

// Session cookie holds a random token; the database stores only its hash (see Session in schema.prisma).
// httpOnly so page scripts can't read it, sameSite=lax so other sites can't submit forms as the user
const SESSION_COOKIE = 'session';
const SESSION_DAYS = 30;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export type CurrentUser = { id: string; name: string; email: string; role: 'USER' | 'ADMIN' };

// Only call from server actions: server components can't set cookies
export async function createSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  // Housekeeping: drop this user's expired sessions while we're here
  await db.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } });
  await db.session.create({ data: { id: hashToken(token), userId, expiresAt } });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

// Only call from server actions
export async function deleteSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  store.delete(SESSION_COOKIE);
}

// Read-only, so it also works in server components. Cached so the navbar, page and actions
// share one lookup per request. The role is read from the database on every request, so
// promoting or deleting a user takes effect immediately
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    select: { expiresAt: true, user: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
});

// For pages: sends logged-out visitors to log in, then back to `returnTo`
export async function requireUser(returnTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath(returnTo));
  return user;
}

export const isAdmin = (user: CurrentUser | null) => user?.role === 'ADMIN';

// Owners manage their own listings; the admin manages every listing, including ones with no owner
export const canManageHome = (user: CurrentUser | null, home: { ownerId: string | null }) =>
  Boolean(user && (isAdmin(user) || (home.ownerId !== null && home.ownerId === user.id)));
