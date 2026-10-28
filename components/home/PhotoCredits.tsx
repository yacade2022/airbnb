import { findDemoPhotoCredits } from '@/lib/demoListings';

type PhotoCreditsProps = {
  // The listing's cover photo followed by its gallery photos
  photos: string[];
};

// Credits for a listing's demo photos, shown on its page. Cards and thumbnails elsewhere link here,
// which CC 4.0 allows (section 3(a)(2)). Renders nothing for photos uploaded by hosts
function PhotoCredits({ photos }: PhotoCreditsProps) {
  const credits = findDemoPhotoCredits(photos);
  if (credits.length === 0) return null;

  return (
    <section aria-label="Photo credits" className="mt-6 text-xs leading-relaxed text-muted-foreground">
      <h3 className="font-medium text-foreground">Photo credits</h3>
      <ul className="mt-1 space-y-0.5">
        {credits.map((credit) => (
          <li key={credit.src} className="break-words">
            <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
              {credit.title}
            </a>{' '}
            by {credit.creator},{' '}
            <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline underline-offset-2 hover:text-foreground">
              {credit.license}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-1">From Wikimedia Commons; resized and converted to PNG. Illustrative only, not photos of a real rental.</p>
    </section>
  );
}

export default PhotoCredits;
