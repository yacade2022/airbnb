// Demo listings added by scripts/seed-demo-listings.mjs, one per photo in public/images/categories.
// The photos come from Wikimedia Commons; most are CC BY or CC BY-SA, which require a visible
// credit, so every place that shows a listing photo looks it up here (see PhotoCredit).
// Keep public/images/categories/ATTRIBUTION.md in sync with demoListings.json.
import demoListings from './demoListings.json';

export { demoListings };

export type DemoPhotoCredit = (typeof demoListings)[number]['photo'];

// Demo photos are the only listing photos stored under this path; hosts' uploads live in Supabase
export const DEMO_PHOTO_PREFIX = '/images/categories/';

const creditsBySrc = new Map(demoListings.map((listing) => [listing.photo.src, listing.photo]));

// The credit for a listing's photo, or undefined for photos uploaded by hosts
export const findDemoPhotoCredit = (photo: string) => creditsBySrc.get(photo);
