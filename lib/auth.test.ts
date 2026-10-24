import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock calls are hoisted, so the mocks they use must be hoisted too
const { db, cookieStore } = vi.hoisted(() => ({
  db: { session: { findUnique: vi.fn(), create: vi.fn(), deleteMany: vi.fn() } },
  cookieStore: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
}));

vi.mock('@/utils/db', () => ({ default: db }));
vi.mock('next/headers', () => ({ cookies: async () => cookieStore }));
// React's cache() only dedupes inside a server request; outside one, call straight through
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  cache: <T,>(fn: T) => fn,
}));

import { createHash } from 'node:crypto';
import { canManageHome, createSession, getCurrentUser, isAdmin } from './auth';
import { hashPassword, verifyPassword } from './password';
import { safeNextPath } from './authRules';

const user = { id: 'user-1', name: 'Ana', email: 'ana@example.com', role: 'USER' as const };
const admin = { ...user, id: 'admin-1', role: 'ADMIN' as const };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getCurrentUser', () => {
  it('is null without a session cookie', async () => {
    cookieStore.get.mockReturnValue(undefined);
    await expect(getCurrentUser()).resolves.toBeNull();
    expect(db.session.findUnique).not.toHaveBeenCalled();
  });

  it('looks the session up by the hash of the token, not the token itself', async () => {
    cookieStore.get.mockReturnValue({ value: 'token-123' });
    db.session.findUnique.mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000), user });

    await expect(getCurrentUser()).resolves.toEqual(user);
    const hash = createHash('sha256').update('token-123').digest('hex');
    expect(db.session.findUnique.mock.calls[0][0].where).toEqual({ id: hash });
  });

  it('is null for an unknown or expired session', async () => {
    cookieStore.get.mockReturnValue({ value: 'token-123' });
    db.session.findUnique.mockResolvedValue(null);
    await expect(getCurrentUser()).resolves.toBeNull();

    db.session.findUnique.mockResolvedValue({ expiresAt: new Date(Date.now() - 1), user });
    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe('createSession', () => {
  it('stores a hashed token and sets an httpOnly, same-site cookie with the raw one', async () => {
    db.session.create.mockResolvedValue({});
    db.session.deleteMany.mockResolvedValue({ count: 0 });

    await createSession('user-1');

    const [name, token, options] = cookieStore.set.mock.calls[0];
    expect(name).toBe('session');
    expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
    const stored = db.session.create.mock.calls[0][0].data;
    expect(stored.id).toBe(createHash('sha256').update(token).digest('hex'));
    expect(stored.id).not.toBe(token);
  });
});

describe('canManageHome', () => {
  it('allows the owner and the admin only', () => {
    expect(canManageHome(user, { ownerId: 'user-1' })).toBe(true);
    expect(canManageHome(user, { ownerId: 'someone-else' })).toBe(false);
    expect(canManageHome(null, { ownerId: 'user-1' })).toBe(false);
    expect(canManageHome(admin, { ownerId: 'someone-else' })).toBe(true);
  });

  it('lets only the admin manage listings with no owner', () => {
    expect(canManageHome(user, { ownerId: null })).toBe(false);
    expect(canManageHome(admin, { ownerId: null })).toBe(true);
  });

  it('isAdmin is true only for the ADMIN role', () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(user)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});

describe('passwords', () => {
  it('verifies the right password and rejects others', async () => {
    const hash = await hashPassword('correct horse');
    await expect(verifyPassword('correct horse', hash)).resolves.toBe(true);
    await expect(verifyPassword('Correct horse', hash)).resolves.toBe(false);
    await expect(verifyPassword('correct horse', 'garbage')).resolves.toBe(false);
  });

  it('salts each hash', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });
});

describe('safeNextPath', () => {
  it.each([
    ['/addHomeToList', '/addHomeToList'],
    ['/homes/1/edit?x=1', '/homes/1/edit?x=1'],
    ['https://evil.example', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    [undefined, '/'],
  ])('%s -> %s', (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});
