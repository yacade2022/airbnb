import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/global/EmptyState';
import ListingActions from '@/components/home/ListingActions';
import { requireUser } from '@/lib/auth';
import { formatListedDate, formatPrice } from '@/lib/format';
import { fetchMyHomes } from '@/utils/actions';

export const metadata: Metadata = { title: 'My listings' };

async function MyListingsPage() {
  await requireUser('/my-listings');
  const homes = await fetchMyHomes();

  return (
    <section className="py-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My listings</h1>
          <p className="mt-2 text-sm text-muted-foreground">Homes you&apos;ve listed. Only you and the site admin can change them.</p>
        </div>
        {homes.length > 0 && (
          <Button asChild variant="brand" className="h-11 px-5">
            <Link href="/addHomeToList"><Plus aria-hidden />Add another home</Link>
          </Button>
        )}
      </div>

      {homes.length === 0 ? (
        <EmptyState title="No listings yet" description="List your place and it will show up here.">
          <Button asChild variant="brand" className="h-11 px-5">
            <Link href="/addHomeToList">Airbnb your home</Link>
          </Button>
        </EmptyState>
      ) : (
        <ul className="mt-8 space-y-4">
          {homes.map((home) => (
            <li key={home.id} className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center">
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-40">
                <Image src={home.photo} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold break-words">
                  <Link href={`/homes/${home.id}`} className="hover:underline">{home.location}</Link>
                </h2>
                <p className="text-sm text-muted-foreground">{home.title} · Listed {formatListedDate(home.createdAt)}</p>
                <p className="mt-1 text-sm"><span className="font-semibold">{formatPrice(home.price)}</span> night</p>
              </div>
              <ListingActions home={home} returnTo="/my-listings" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MyListingsPage;
