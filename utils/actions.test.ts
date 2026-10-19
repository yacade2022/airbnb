import { beforeEach, describe, expect, it, vi } from 'vitest';

// vi.mock calls are hoisted, so the mocks they use must be hoisted too
const { db, storage, bucket, revalidatePath, redirect } = vi.hoisted(() => {
  const bucket = {
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
    remove: vi.fn(),
  };
  return {
    db: { home: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() } },
    bucket,
    storage: { from: vi.fn(() => bucket) },
    revalidatePath: vi.fn(),
    // The real redirect() throws to stop execution; mimic that
    redirect: vi.fn(() => {
      throw new Error('NEXT_REDIRECT');
    }),
  };
});

vi.mock('./db', () => ({ default: db }));
vi.mock('@/lib/supabase', () => ({ getSupabase: () => ({ storage }) }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({ redirect }));

import { addHomeToList, fetchAllHome, fetchHomeById } from './actions';

const PUBLIC_URL = 'https://example.supabase.co/storage/v1/object/public/image/1700000000000-beach_house.png';

function imageFile({ name = 'beach house.png', type = 'image/png', size = 10 } = {}) {
  return new File([new Uint8Array(size)], name, { type });
}

function buildForm(overrides: Record<string, string | File | null> = {}) {
  const fields: Record<string, string | File | null> = {
    title: 'Beach',
    location: 'Lisbon, Portugal',
    description: 'Sunny flat near the river',
    price: '120',
    image: imageFile(),
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== null) formData.append(key, value);
  }
  return formData;
}

const submit = (overrides?: Record<string, string | File | null>) => addHomeToList({}, buildForm(overrides));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
  bucket.upload.mockResolvedValue({ data: { path: '1700000000000-beach_house.png' }, error: null });
  bucket.getPublicUrl.mockReturnValue({ data: { publicUrl: PUBLIC_URL } });
  bucket.remove.mockResolvedValue({ data: [], error: null });
  db.home.create.mockResolvedValue({ id: 'home-1' });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('addHomeToList validation', () => {
  it.each([
    ['an unknown category', { title: 'Castle' }, 'Please choose a valid category.', 'title'],
    ['a missing category', { title: null }, 'Please choose a valid category.', 'title'],
    ['a blank location', { location: '   ' }, 'Please enter a location.', 'location'],
    ['a location over 100 characters', { location: 'a'.repeat(101) }, 'Location must be 100 characters or fewer.', 'location'],
    ['a blank description', { description: '' }, 'Please enter a description.', 'description'],
    ['a description over 1000 characters', { description: 'a'.repeat(1001) }, 'Description must be 1000 characters or fewer.', 'description'],
    ['an empty price', { price: '' }, 'Price must be a whole number greater than 0.', 'price'],
    ['a zero price', { price: '0' }, 'Price must be a whole number greater than 0.', 'price'],
    ['a negative price', { price: '-5' }, 'Price must be a whole number greater than 0.', 'price'],
    ['a fractional price', { price: '12.5' }, 'Price must be a whole number greater than 0.', 'price'],
    ['a non-numeric price', { price: 'abc' }, 'Price must be a whole number greater than 0.', 'price'],
    ['no image field', { image: null }, 'Please choose an image.', 'image'],
    // What a browser sends for an untouched file input
    ['an empty file input', { image: imageFile({ name: '', type: 'application/octet-stream', size: 0 }) }, 'Please choose an image.', 'image'],
    ['a non-image file', { image: imageFile({ name: 'notes.txt', type: 'text/plain' }) }, 'The uploaded file must be an image.', 'image'],
    ['an image over 4 MB', { image: imageFile({ size: 4 * 1024 * 1024 + 1 }) }, 'Image must be 4 MB or smaller.', 'image'],
  ])('rejects %s without uploading or saving', async (_case, overrides, message, field) => {
    const result = await submit(overrides);

    expect(result.error).toBe(message);
    expect(result.field).toBe(field);
    expect(bucket.upload).not.toHaveBeenCalled();
    expect(db.home.create).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('accepts an image of exactly 4 MB', async () => {
    await expect(submit({ image: imageFile({ size: 4 * 1024 * 1024 }) })).rejects.toThrow('NEXT_REDIRECT');
    expect(db.home.create).toHaveBeenCalledOnce();
  });

  it('returns the submitted values so the form can keep them', async () => {
    const result = await submit({ price: '12.5', location: '  Lisbon, Portugal ' });

    expect(result.values).toEqual({
      title: 'Beach',
      location: 'Lisbon, Portugal',
      description: 'Sunny flat near the river',
      price: '12.5',
    });
  });
});

describe('addHomeToList success', () => {
  it('uploads the image, saves the home, then revalidates and redirects to the new listing', async () => {
    await expect(submit({ description: '  Sunny flat near the river  ' })).rejects.toThrow('NEXT_REDIRECT');

    expect(storage.from).toHaveBeenCalledWith('image');
    expect(bucket.upload).toHaveBeenCalledWith(
      // Spaces and special characters are replaced in the stored filename
      '1700000000000-beach_house.png',
      expect.any(Uint8Array),
      { contentType: 'image/png' }
    );
    expect(db.home.create).toHaveBeenCalledWith({
      data: {
        title: 'Beach',
        location: 'Lisbon, Portugal',
        description: 'Sunny flat near the river',
        price: 120,
        photo: PUBLIC_URL,
      },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(redirect).toHaveBeenCalledWith('/homes/home-1?created=1');
  });
});

describe('addHomeToList failures', () => {
  it('reports an upload error and does not save the home', async () => {
    bucket.upload.mockResolvedValue({ data: null, error: { message: 'Bucket not found' } });

    const result = await submit();

    expect(result.error).toBe('Image upload failed. Please try again.');
    expect(result.values?.location).toBe('Lisbon, Portugal');
    expect(db.home.create).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('removes the uploaded image when saving to the database fails', async () => {
    db.home.create.mockRejectedValue(new Error('connection refused'));

    const result = await submit();

    expect(result.error).toBe('Something went wrong while saving your home. Please try again.');
    expect(bucket.remove).toHaveBeenCalledWith(['1700000000000-beach_house.png']);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('fetchAllHome', () => {
  it('returns all homes, newest first, when no category is given', async () => {
    db.home.findMany.mockResolvedValue([{ id: 'home-1' }]);

    await expect(fetchAllHome()).resolves.toEqual([{ id: 'home-1' }]);
    expect(db.home.findMany).toHaveBeenCalledWith({ where: undefined, orderBy: { createdAt: 'desc' } });
  });

  it('filters by category title', async () => {
    db.home.findMany.mockResolvedValue([]);

    await fetchAllHome('Beach');
    expect(db.home.findMany).toHaveBeenCalledWith({ where: { title: 'Beach' }, orderBy: { createdAt: 'desc' } });
  });

  it('searches location and description case-insensitively, ignoring surrounding spaces', async () => {
    db.home.findMany.mockResolvedValue([]);

    await fetchAllHome(undefined, '  lisbon ');
    expect(db.home.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { location: { contains: 'lisbon', mode: 'insensitive' } },
          { description: { contains: 'lisbon', mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('combines a category with a search', async () => {
    db.home.findMany.mockResolvedValue([]);

    await fetchAllHome('Beach', 'river');
    expect(db.home.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ title: 'Beach', OR: expect.any(Array) }) })
    );
  });

  it('treats a blank search as no search', async () => {
    db.home.findMany.mockResolvedValue([]);

    await fetchAllHome(undefined, '   ');
    expect(db.home.findMany).toHaveBeenCalledWith({ where: undefined, orderBy: { createdAt: 'desc' } });
  });
});

describe('fetchHomeById', () => {
  it('looks the home up by id', async () => {
    db.home.findUnique.mockResolvedValue({ id: 'home-1' });

    await expect(fetchHomeById('home-1')).resolves.toEqual({ id: 'home-1' });
    expect(db.home.findUnique).toHaveBeenCalledWith({ where: { id: 'home-1' } });
  });
});
