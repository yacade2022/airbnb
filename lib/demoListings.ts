// Demo listings added by scripts/seed-demo-listings.mjs, one per photo in public/images/categories.
// The photos come from Wikimedia Commons and are credited on /credits, which every page links to
// from the footer, not next to the photo (see CREDITS_PAGE_LICENSES in lib/imageCredits.ts).
// Keep public/images/categories/ATTRIBUTION.md in sync with demoListings.json.
import demoListingsJson from './demoListings.json';

export type DemoPhotoCredit = {
  src: string;
  alt: string;
  title: string;
  creator: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
};

export type DemoListing = {
  title: string;
  location: string;
  description: string;
  price: number;
  photo: DemoPhotoCredit;
  // Up to MAX_GALLERY_PHOTOS more photos of the same place, shown beside the description.
  // Left out where no openly licensed photos of that place were found
  gallery?: DemoPhotoCredit[];
};

export const demoListings: DemoListing[] = demoListingsJson;

// Every demo photo, covers and gallery photos alike
export const demoPhotos = demoListings.flatMap((listing) => [listing.photo, ...(listing.gallery ?? [])]);

// Demo photos are the only listing photos stored under this path; hosts' uploads live in Supabase
export const DEMO_PHOTO_PREFIX = '/images/categories/';

const creditsBySrc = new Map(demoPhotos.map((photo) => [photo.src, photo]));

// The credit (with alt text) for a listing's cover or gallery photo, or undefined for photos uploaded by hosts
export const findDemoPhotoCredit = (photo: string) => creditsBySrc.get(photo);
