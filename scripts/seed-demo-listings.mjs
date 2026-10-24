// Adds the demo listings in lib/demoListings.json, one per photo in public/images/categories,
// so every category has homes to browse. Run it on a machine with access to the database:
//
//   npm run seed-demo                          add them, owned by the oldest admin account
//   npm run seed-demo -- someone@example.com   add them, owned by that account
//   npm run seed-demo -- --remove              delete every demo listing, with its favorites and reservations
//
// Safe to run again: listings whose photo is already used aren't added again, but their location,
// description and price are brought up to date with demoListings.json.
import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

// Keep in sync with DEMO_PHOTO_PREFIX in lib/demoListings.ts. Hosts' uploads live in Supabase,
// so no real listing has a photo under this path
const DEMO_PHOTO_PREFIX = '/images/categories/';

const [arg] = process.argv.slice(2);
const db = new PrismaClient();
try {
  if (arg === '--remove') {
    const { count } = await db.home.deleteMany({ where: { photo: { startsWith: DEMO_PHOTO_PREFIX } } });
    console.log(`Removed ${count} demo listing(s).`);
  } else {
    const owner = arg
      ? await db.user.findUnique({ where: { email: arg.trim().toLowerCase() } })
      : await db.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } });
    if (!owner) {
      console.error(arg
        ? `No account with the email ${arg}. Register it on the site first, then run this again.`
        : 'No admin account yet. Run npm run make-admin -- <email> first, or pass an email.');
      process.exitCode = 1;
    } else {
      const listings = JSON.parse(await readFile(new URL('../lib/demoListings.json', import.meta.url), 'utf8'));
      const existing = await db.home.findMany({
        where: { photo: { startsWith: DEMO_PHOTO_PREFIX } },
        select: { id: true, photo: true, location: true, description: true, price: true },
      });
      const byPhoto = new Map(existing.map((home) => [home.photo, home]));
      const data = listings
        .filter((listing) => !byPhoto.has(listing.photo.src))
        .map(({ title, location, description, price, photo }) => ({
          title, location, description, price, photo: photo.src, ownerId: owner.id,
        }));
      const { count } = await db.home.createMany({ data });

      // A photo file can be swapped for another image, so keep its listing's text in step with it
      let updated = 0;
      for (const { location, description, price, photo } of listings) {
        const home = byPhoto.get(photo.src);
        if (home && (home.location !== location || home.description !== description || home.price !== price)) {
          await db.home.update({ where: { id: home.id }, data: { location, description, price } });
          updated++;
        }
      }
      console.log(`Added ${count} demo listing(s) owned by ${owner.email}; updated ${updated} existing one(s).`);
    }
  }
} finally {
  await db.$disconnect();
}
