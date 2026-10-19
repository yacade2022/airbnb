import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn(() => ({ storage: {} })) }));
vi.mock('@supabase/supabase-js', () => ({ createClient }));

// The client is cached at module level, so load a fresh copy for each test
const loadGetSupabase = async () => (await import('./supabase')).getSupabase;

beforeEach(() => {
  vi.resetModules();
  createClient.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getSupabase', () => {
  it.each([
    ['SUPABASE_URL', { SUPABASE_URL: '', SUPABASE_ANON_KEY: 'test-key' }],
    ['SUPABASE_ANON_KEY', { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: '' }],
  ])('throws a clear error when %s is missing', async (_name, env) => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    const getSupabase = await loadGetSupabase();

    expect(() => getSupabase()).toThrow('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
    expect(createClient).not.toHaveBeenCalled();
  });

  it('creates the client once and reuses it', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'test-key');
    const getSupabase = await loadGetSupabase();

    const first = getSupabase();
    const second = getSupabase();

    expect(first).toBe(second);
    expect(createClient).toHaveBeenCalledOnce();
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'test-key', {
      realtime: { transport: expect.any(Function) },
    });
  });
});
