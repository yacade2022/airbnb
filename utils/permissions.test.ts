import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock calls are hoisted, so the mocks they use must be hoisted too
const { db, bucket, getCurrentUser, revalidatePath, redirect } = vi.hoisted(() => ({
  db: {
    home: { findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
    user: { findUnique: vi.fn(), findMany: vi.fn(), delete: vi.fn() },
  },
  bucket: { upload: vi.fn(), getPublicUrl: vi.fn(), remove: vi.fn() },
  getCurrentUser: vi.fn(),
  revalidatePath: vi.fn(),
  // The real redirect() throws to stop execution; mimic that
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('./db', () => ({ default: db }));
vi.mock('@/lib/supabase', () => ({ getSupabase: () => ({ storage: { from: () => bucket } }) }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({ redirect }));
// Only the session lookup is faked; canManageHome and isAdmin are the real ones
vi.mock('@/lib/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/auth')>()),
  getCurrentUser,
}));

import { deleteHome, deleteUser, fetchAdminHomes, fetchAdminUsers, fetchMyHomes, updateHome } from './actions';

const owner = { id: 'owner-1', name: 'Olive', email: 'olive@example.com', role: 'USER' as const };
const stranger = { id: 'user-2', name: 'Sam', email: 'sam@example.com', role: 'USER' as const };
const admin = { id: 'admin-1', name: 'Ada', email: 'ada@example.com', role: 'ADMIN' as const };

const PHOTO = 'https://example.supabase.co/storage/v1/object/public/image/old%20photo.png';

function editForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const fields = {
    homeId: 'home-1',
    title: 'Beach',
    location: 'Lisbon, Portugal',
    description: 'Sunny flat',
    price: '150',
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) formData.append(key, value);
  return formData;
}

const edit = (overrides?: Record<string, string>) => updateHome({}, editForm(overrides));

beforeEach(() => {
  vi.clearAllMocks();
  db.home.findUnique.mockResolvedValue({ ownerId: owner.id, photo: PHOTO, gallery: [] });
  db.home.update.mockResolvedValue({});
  db.home.delete.mockResolvedValue({});
  db.user.delete.mockResolvedValue({});
  bucket.remove.mockResolvedValue({ data: [], error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('updateHome', () => {
  it('sends logged-out visitors to log in and changes nothing', async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(edit()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/login?next=%2Fhomes%2Fhome-1%2Fedit');
    expect(db.home.update).not.toHaveBeenCalled();
  });

  it("refuses to edit someone else's listing", async () => {
    getCurrentUser.mockResolvedValue(stranger);

    const result = await edit({ price: '1' });

    expect(result.error).toBe('You can only edit your own listings.');
    expect(db.home.update).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('refuses to let a regular user edit a listing with no owner', async () => {
    getCurrentUser.mockResolvedValue(stranger);
    db.home.findUnique.mockResolvedValue({ ownerId: null, photo: PHOTO, gallery: [] });

    expect((await edit()).error).toBe('You can only edit your own listings.');
    expect(db.home.update).not.toHaveBeenCalled();
  });

  it('lets the owner edit their listing and keeps the photo when none is chosen', async () => {
    getCurrentUser.mockResolvedValue(owner);

    await expect(edit()).rejects.toThrow('NEXT_REDIRECT');
    expect(db.home.update).toHaveBeenCalledWith({
      where: { id: 'home-1' },
      data: { title: 'Beach', location: 'Lisbon, Portugal', description: 'Sunny flat', price: 150, gallery: [] },
    });
    expect(bucket.upload).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/homes/home-1?updated=1');
  });

  it('never changes the owner, even if the form sends one', async () => {
    getCurrentUser.mockResolvedValue(owner);

    await expect(edit({ ownerId: stranger.id })).rejects.toThrow('NEXT_REDIRECT');
    expect(db.home.update.mock.calls[0][0].data).not.toHaveProperty('ownerId');
  });

  it("lets the admin edit anyone's listing", async () => {
    getCurrentUser.mockResolvedValue(admin);

    await expect(edit()).rejects.toThrow('NEXT_REDIRECT');
    expect(db.home.update).toHaveBeenCalledOnce();
  });

  it('still validates fields for the owner', async () => {
    getCurrentUser.mockResolvedValue(owner);

    const result = await edit({ price: '0' });

    expect(result.field).toBe('price');
    expect(db.home.update).not.toHaveBeenCalled();
  });

  it('reports a listing that no longer exists', async () => {
    getCurrentUser.mockResolvedValue(owner);
    db.home.findUnique.mockResolvedValue(null);

    expect((await edit()).error).toBe('This listing no longer exists.');
  });
});

describe('deleteHome', () => {
  it('sends logged-out visitors to log in and deletes nothing', async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(deleteHome('home-1', '/my-listings')).rejects.toThrow('NEXT_REDIRECT');
    expect(db.home.delete).not.toHaveBeenCalled();
  });

  it("refuses to delete someone else's listing", async () => {
    getCurrentUser.mockResolvedValue(stranger);

    await deleteHome('home-1', '/my-listings');

    expect(db.home.delete).not.toHaveBeenCalled();
    expect(bucket.remove).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('lets the owner delete their listing and removes its photo', async () => {
    getCurrentUser.mockResolvedValue(owner);

    await expect(deleteHome('home-1', '/my-listings')).rejects.toThrow('NEXT_REDIRECT');
    expect(db.home.delete).toHaveBeenCalledWith({ where: { id: 'home-1' } });
    expect(bucket.remove).toHaveBeenCalledWith(['old photo.png']);
    expect(redirect).toHaveBeenCalledWith('/my-listings');
  });

  it("lets the admin delete anyone's listing", async () => {
    getCurrentUser.mockResolvedValue(admin);

    await expect(deleteHome('home-1', '/admin')).rejects.toThrow('NEXT_REDIRECT');
    expect(db.home.delete).toHaveBeenCalledOnce();
  });

  it('does not redirect off-site after deleting', async () => {
    getCurrentUser.mockResolvedValue(owner);

    await expect(deleteHome('home-1', '//evil.example')).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/');
  });
});

describe('fetchMyHomes', () => {
  it("returns only the logged-in user's listings", async () => {
    getCurrentUser.mockResolvedValue(owner);
    db.home.findMany.mockResolvedValue([]);

    await fetchMyHomes();
    expect(db.home.findMany).toHaveBeenCalledWith({ where: { ownerId: owner.id }, orderBy: { createdAt: 'desc' } });
  });

  it('returns nothing to logged-out visitors', async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(fetchMyHomes()).resolves.toEqual([]);
    expect(db.home.findMany).not.toHaveBeenCalled();
  });
});

describe('admin data', () => {
  it.each([
    ['logged-out visitors', null],
    ['regular users', stranger],
  ])('hides all listings and users from %s', async (_case, user) => {
    getCurrentUser.mockResolvedValue(user);

    await expect(fetchAdminHomes()).resolves.toEqual([]);
    await expect(fetchAdminUsers()).resolves.toEqual([]);
    expect(db.home.findMany).not.toHaveBeenCalled();
    expect(db.user.findMany).not.toHaveBeenCalled();
  });

  it('gives the admin every listing and user, without password hashes', async () => {
    getCurrentUser.mockResolvedValue(admin);
    db.home.findMany.mockResolvedValue([{ id: 'home-1' }]);
    db.user.findMany.mockResolvedValue([{ id: 'owner-1' }]);

    await expect(fetchAdminHomes()).resolves.toEqual([{ id: 'home-1' }]);
    await expect(fetchAdminUsers()).resolves.toEqual([{ id: 'owner-1' }]);
    expect(db.home.findMany.mock.calls[0][0]).not.toHaveProperty('where');
    expect(db.user.findMany.mock.calls[0][0].select).not.toHaveProperty('passwordHash');
  });
});

describe('deleteUser', () => {
  it.each([
    ['logged-out visitors', null],
    ['regular users', stranger],
  ])('is refused for %s', async (_case, user) => {
    getCurrentUser.mockResolvedValue(user);

    await deleteUser(owner.id);
    expect(db.user.findUnique).not.toHaveBeenCalled();
    expect(db.user.delete).not.toHaveBeenCalled();
  });

  it("lets the admin delete a regular user and their listings' photos", async () => {
    getCurrentUser.mockResolvedValue(admin);
    db.user.findUnique.mockResolvedValue({ role: 'USER', homes: [{ photo: PHOTO }] });

    await deleteUser(owner.id);
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: owner.id } });
    expect(bucket.remove).toHaveBeenCalledWith(['old photo.png']);
  });

  it('never deletes an admin account, including the admin themselves', async () => {
    getCurrentUser.mockResolvedValue(admin);
    db.user.findUnique.mockResolvedValue({ role: 'ADMIN', homes: [] });

    await deleteUser(admin.id);
    expect(db.user.delete).not.toHaveBeenCalled();
  });
});
