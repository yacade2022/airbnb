import type { Metadata } from 'next';
import Image from 'next/image';
import AddHomeForm from '@/components/form/AddHomeForm';
import PhotoCredit from '@/components/global/PhotoCredit';
import { imageCredits } from '@/lib/imageCredits';
import { requireUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Airbnb your home' };

async function AddHome() {
  // Logged-out visitors are sent to log in, then brought back here
  await requireUser('/addHomeToList');
  const photo = imageCredits.lakeLivingRoom;

  return (
    <section className="py-8 pb-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Airbnb your home</h1>
          <p className="mt-2 text-muted-foreground">
            Add a few details and a photo. Your listing appears on the home page as soon as you publish it.
          </p>
          <div className="mt-8 rounded-2xl border p-5 shadow-sm sm:p-8">
            <AddHomeForm />
          </div>
        </div>

        <aside className="hidden lg:block" aria-label="Listing tips">
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1280px) 416px, 352px" className="object-cover" />
            </div>
            <figcaption>
              <PhotoCredit credit={photo} className="mt-1.5 text-muted-foreground" />
            </figcaption>
          </figure>
          <h2 className="mt-6 font-semibold">Tips for a clear listing</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Use a bright, landscape photo of the actual space.</li>
            <li>Include the town and country in the location.</li>
            <li>Describe what guests can expect: rooms, beds, and what&apos;s nearby.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default AddHome;
