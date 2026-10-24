import type { Metadata } from 'next';
import Image from 'next/image';
import { imageCredits, type ImageCredit } from '@/lib/imageCredits';
import { demoListings } from '@/lib/demoListings';

export const metadata: Metadata = { title: 'Image credits' };

type Credit = Pick<ImageCredit, 'src' | 'alt' | 'title' | 'creator' | 'license' | 'licenseUrl' | 'sourceUrl'>;

function CreditItem({ credit }: { credit: Credit }) {
  return (
    <li className="flex flex-col gap-4 py-6 sm:flex-row">
      <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-48">
        <Image src={credit.src} alt={credit.alt} fill sizes="(min-width: 640px) 192px, 100vw" className="object-cover" />
      </div>
      <div className="min-w-0 text-sm">
        <p className="font-medium break-words">{credit.title}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
          <dt>Creator</dt>
          <dd className="text-foreground break-words">{credit.creator}</dd>
          <dt>License</dt>
          <dd>
            <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="text-foreground underline underline-offset-2">
              {credit.license}
            </a>
          </dd>
          <dt>Source</dt>
          <dd>
            <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">
              Wikimedia Commons
            </a>
          </dd>
        </dl>
      </div>
    </li>
  );
}

function CreditsPage() {
  return (
    <section className="max-w-3xl py-8 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Image credits</h1>
      <p className="mt-2 text-muted-foreground">
        These photos are illustrative only and are not photos of any real rental. Photos of hosts&apos; own
        listings are uploaded by the hosts. Images are resized, cropped for display and, for demo listings,
        converted to PNG.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Site photos</h2>
      <ul className="mt-2 divide-y border-y">
        {Object.values(imageCredits).map((credit) => (
          <CreditItem key={credit.src} credit={credit} />
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Demo listing photos</h2>
      <ul className="mt-2 divide-y border-y">
        {demoListings.map(({ photo }) => (
          <CreditItem key={photo.src} credit={photo} />
        ))}
      </ul>
    </section>
  );
}

export default CreditsPage;
