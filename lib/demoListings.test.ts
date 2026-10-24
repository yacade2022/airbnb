import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DEMO_PHOTO_PREFIX, demoListings, findDemoPhotoCredit } from './demoListings';
import { categoryHouses } from './categoryHouses';
import { MAX_DESCRIPTION_LENGTH, MAX_LOCATION_LENGTH } from './listingRules';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));

describe('demo listings', () => {
  it('has 4 listings for every category', () => {
    for (const category of categoryHouses) {
      expect(demoListings.filter((listing) => listing.title === category.title)).toHaveLength(4);
    }
    expect(demoListings).toHaveLength(categoryHouses.length * 4);
  });

  it('only uses photos that exist, once each', () => {
    const srcs = demoListings.map((listing) => listing.photo.src);
    expect(new Set(srcs).size).toBe(srcs.length);
    for (const src of srcs) {
      expect(src.startsWith(DEMO_PHOTO_PREFIX)).toBe(true);
      expect(src.endsWith('.png')).toBe(true);
      expect(existsSync(`${publicDir}${src}`)).toBe(true);
    }
  });

  it('passes the same rules as the add-home form', () => {
    for (const { location, description, price } of demoListings) {
      expect(location.length).toBeGreaterThan(0);
      expect(location.length).toBeLessThanOrEqual(MAX_LOCATION_LENGTH);
      expect(description.length).toBeGreaterThan(0);
      expect(description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
      expect(Number.isInteger(price) && price > 0).toBe(true);
    }
  });

  it('has a complete credit for every photo', () => {
    for (const { photo } of demoListings) {
      expect(photo.creator).toBeTruthy();
      expect(photo.alt).toBeTruthy();
      expect(photo.license).toMatch(/^(CC0|Public domain|CC BY(-SA)? \d\.\d)$/);
      expect(photo.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(photo.licenseUrl).toMatch(/^https?:\/\//);
    }
  });
});

describe('findDemoPhotoCredit', () => {
  it('finds the credit for a demo photo', () => {
    const [first] = demoListings;
    expect(findDemoPhotoCredit(first.photo.src)).toBe(first.photo);
  });

  it('returns nothing for photos uploaded by hosts', () => {
    expect(findDemoPhotoCredit('https://example.supabase.co/storage/v1/object/public/image/a.avif')).toBeUndefined();
  });
});
