import type { Metadata } from 'next';
import Image from 'next/image';
import { imageCredits } from '@/lib/imageCredits';

export const metadata: Metadata = { title: 'Image credits' };

function CreditsPage() {
  return (
    <section className="max-w-3xl py-8 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Image credits</h1>
      <p className="mt-2 text-muted-foreground">
        These photos decorate the site. They are illustrative only and are not photos of any listed home.
        Listing photos are uploaded by hosts. Images are resized and cropped for display.
      </p>
      <ul className="mt-8 divide-y border-y">
        {Object.values(imageCredits).map((credit) => (
          <li key={credit.src} className="flex flex-col gap-4 py-6 sm:flex-row">
            <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-48">
              <Image src={credit.src} alt={credit.alt} fill sizes="(min-width: 640px) 192px, 100vw" className="object-cover" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-medium break-words">{credit.title}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
                <dt>Creator</dt>
                <dd className="text-foreground">{credit.creator}</dd>
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
        ))}
      </ul>
    </section>
  );
}

export default CreditsPage;
