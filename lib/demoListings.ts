// Demo listings added by scripts/seed-demo-listings.mjs, one per photo in public/images/categories.
// The photos come from Wikimedia Commons and are credited on /credits, which every page links to
// from the footer, not next to the photo (see CREDITS_PAGE_LICENSES in lib/imageCredits.ts).
// Keep public/images/categories/ATTRIBUTION.md in sync with demoListings.json.
import demoListings from './demoListings.json';

export { demoListings };

export type DemoPhotoCredit = (typeof demoListings)[number]['photo'];

// Demo photos are the only listing photos stored under this path; hosts' uploads live in Supabase
export const DEMO_PHOTO_PREFIX = '/images/categories/';

const creditsBySrc = new Map(demoListings.map((listing) => [listing.photo.src, listing.photo]));

// The credit (with alt text) for a listing's photo, or undefined for photos uploaded by hosts
export const findDemoPhotoCredit = (photo: string) => creditsBySrc.get(photo);
