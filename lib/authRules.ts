// Shared by the login/register forms (client-side hints) and utils/authActions.ts (server validation)

export const MIN_PASSWORD_LENGTH = 8;
// scrypt hashes any length, but an upper bound stops huge inputs from tying up the server
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_NAME_LENGTH = 60;
export const MAX_EMAIL_LENGTH = 254;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Only same-site paths are allowed after login, so a crafted ?next= link can't send people to
// another site. "//evil.com" and "/\evil.com" are treated by browsers as other origins
export function safeNextPath(next: unknown, fallback = '/') {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return fallback;
  }
  return next;
}

export const loginPath = (next: string) => `/login?next=${encodeURIComponent(next)}`;
