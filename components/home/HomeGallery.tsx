import Image from 'next/image';
import type { Home } from '@prisma/client';
import { findDemoPhotoCredit } from '@/lib/demoListings';

type HomeGalleryProps = {
  home: Pick<Home, 'title' | 'location' | 'gallery'>;
};

// A listing's extra photos (up to MAX_GALLERY_PHOTOS), shown beside its description.
// The cover photo isn't repeated here. Renders nothing for listings without any
function HomeGallery({ home }: HomeGalleryProps) {
  if (home.gallery.length === 0) return null;

  return (
    // Side by side from small screens up, stacked on phones
    <ul aria-label="More photos of this home" className="mt-6 grid gap-4 sm:grid-cols-2">
      {home.gallery.map((src, index) => (
        <li key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
          <Image
            src={src}
            alt={
              findDemoPhotoCredit(src)?.alt ??
              `Photo ${index + 2} of this ${home.title.toLowerCase()} home in ${home.location}`
            }
            fill
            sizes="(min-width: 1280px) 420px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

export default HomeGallery;
