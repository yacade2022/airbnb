import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock calls are hoisted, so the mocks they use must be hoisted too
const { db, auth, redirect } = vi.hoisted(() => ({
  db: { user: { create: vi.fn(), findUnique: vi.fn() } },
  auth: { createSession: vi.fn(), deleteSession: vi.fn() },
  // The real redirect() throws to stop execution; mimic that
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('./db', () => ({ default: db }));
vi.mock('@/lib/auth', () => auth);
vi.mock('next/navigation', () => ({ redirect }));

import { Prisma } from '@prisma/client';
import { hashPassword } from '@/lib/password';
import { loginUser, logoutUser, registerUser } from './authActions';

function form(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.append(key, value);
  return formData;
}

const register = (overrides: Record<string, string> = {}) =>
  registerUser({}, form({ name: 'Ana', email: 'Ana@Example.com ', password: 'correct horse', ...overrides }));

const login = (overrides: Record<string, string> = {}) =>
  loginUser({}, form({ email: 'ana@example.com', password: 'correct horse', ...overrides }));

let storedHash: string;

beforeEach(async () => {
  vi.clearAllMocks();
  storedHash ??= await hashPassword('correct horse');
  db.user.create.mockResolvedValue({ id: 'user-1' });
  db.user.findUnique.mockResolvedValue({ id: 'user-1', passwordHash: storedHash });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('registerUser', () => {
  it('creates a regular user with a hashed password, then sends them to log in', async () => {
    await expect(register()).rejects.toThrow('NEXT_REDIRECT');

    const { data } = db.user.create.mock.calls[0][0];
    expect(data).toMatchObject({ name: 'Ana', email: 'ana@example.com', role: 'USER' });
    expect(data.passwordHash).toMatch(/^scrypt\$/);
    expect(data.passwordHash).not.toContain('correct horse');
    // Registering doesn't log in; that's a separate step
    expect(auth.createSession).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/login?registered=1&email=ana%40example.com&next=%2F');
  });

  it.each(['ADMIN', 'admin'])('ignores a "role" field set to %s', async (role) => {
    await expect(register({ role })).rejects.toThrow('NEXT_REDIRECT');
    expect(db.user.create.mock.calls[0][0].data.role).toBe('USER');
  });

  it('keeps the add-home form as the destination after logging in', async () => {
    await expect(register({ next: '/addHomeToList' })).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith(expect.stringContaining('next=%2FaddHomeToList'));
  });

  it.each([
    ['a blank name', { name: ' ' }, 'name'],
    ['an invalid email', { email: 'not-an-email' }, 'email'],
    ['a short password', { password: 'short' }, 'password'],
    ['a very long password', { password: 'a'.repeat(129) }, 'password'],
  ])('rejects %s', async (_case, overrides, field) => {
    const result = await register(overrides);

    expect(result.field).toBe(field);
    expect(db.user.create).not.toHaveBeenCalled();
  });

  it('reports an email that is already registered', async () => {
    db.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'test' })
    );

    const result = await register();
    expect(result.field).toBe('email');
    expect(result.error).toMatch(/already exists/);
  });

  it('never sends the password back to the form', async () => {
    const result = await register({ name: '' });
    expect(JSON.stringify(result)).not.toContain('correct horse');
  });
});

describe('loginUser', () => {
  it('starts a session for the right password and returns to the add-home form', async () => {
    await expect(login({ next: '/addHomeToList' })).rejects.toThrow('NEXT_REDIRECT');

    expect(auth.createSession).toHaveBeenCalledWith('user-1');
    expect(redirect).toHaveBeenCalledWith('/addHomeToList');
  });

  it('matches emails regardless of case', async () => {
    await expect(login({ email: ' ANA@example.com' })).rejects.toThrow('NEXT_REDIRECT');
    expect(db.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'ana@example.com' } }));
  });

  it('rejects a wrong password without starting a session', async () => {
    const result = await login({ password: 'wrong horse' });

    expect(result.error).toBe('Incorrect email or password.');
    expect(auth.createSession).not.toHaveBeenCalled();
  });

  it('gives the same message for an unknown email, so accounts cannot be discovered', async () => {
    db.user.findUnique.mockResolvedValue(null);

    expect((await login()).error).toBe('Incorrect email or password.');
    expect(auth.createSession).not.toHaveBeenCalled();
  });

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)'])(
    'does not redirect off-site to %s',
    async (next) => {
      await expect(login({ next })).rejects.toThrow('NEXT_REDIRECT');
      expect(redirect).toHaveBeenCalledWith('/');
    }
  );
});

describe('logoutUser', () => {
  it('ends the session and goes home', async () => {
    await expect(logoutUser()).rejects.toThrow('NEXT_REDIRECT');
    expect(auth.deleteSession).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/');
  });
});
