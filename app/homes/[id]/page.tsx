import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ArrowLeft, CalendarDays, CircleCheck, MapPin } from 'lucide-react';
import { fetchBookedDates, fetchFavoriteIds, fetchHomeById } from '@/utils/actions';
import { findCategoryByTitle } from '@/lib/categoryHouses';
import { formatListedDate, formatPrice, formatStayDates } from '@/lib/format';
import FavoriteButton from '@/components/home/FavoriteButton';
import ReservationForm from '@/components/form/ReservationForm';

type HomePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

// Shared by generateMetadata and the page so the home is only queried once per request
const getHome = cache(fetchHomeById);

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const home = await getHome((await params).id);
  return { title: home ? `${home.title} home in ${home.location}` : 'Home not found' };
}

async function HomeDetailsPage({ params, searchParams }: HomePageProps) {
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const home = await getHome(id);
  if (!home) notFound();
  const [favoriteIds, bookedDates] = await Promise.all([fetchFavoriteIds(), fetchBookedDates(home.id)]);

  const category = findCategoryByTitle(home.title);
  const CategoryIcon = category?.icon;

  return (
    <article className="py-6 pb-16 sm:py-8">
      <Link
        href="/"
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium hover:bg-accent"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All homes
      </Link>

      {created === '1' && (
        <div
          role="status"
          className="mt-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success-soft p-4 text-sm text-success"
        >
          <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            <span className="font-semibold">Your home is listed.</span> It now appears on the home page
            {category && <> and in the {category.title} category</>}.
          </p>
        </div>
      )}

      <header className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight break-words sm:text-3xl">{home.location}</h1>
          <FavoriteButton homeId={home.id} isFavorite={favoriteIds.has(home.id)} className="shrink-0" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {category ? (
            <Link
              href={`/?filter=${category.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium text-foreground hover:bg-accent"
            >
              {CategoryIcon && <CategoryIcon className="size-4" aria-hidden />}
              {home.title}
            </Link>
          ) : (
            <span>{home.title}</span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            Listed {formatListedDate(home.createdAt)}
          </span>
        </div>
      </header>

      {/* Mobile order: photo, price, description. On large screens the price card sits in a sticky right column */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-x-12">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted sm:aspect-[16/10]">
            <Image
              src={home.photo}
              alt={`Photo of this ${home.title.toLowerCase()} home in ${home.location}`}
              fill
              priority
              sizes="(min-width: 1280px) 860px, (min-width: 1024px) 66vw, 100vw"
              className="object-cover"
            />
          </div>
          <a
            href={home.photo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            View full-size photo
          </a>
        </div>

        <aside aria-label="Price and booking" className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="rounded-2xl border p-6 shadow-sm">
            <p>
              <span className="text-2xl font-semibold">{formatPrice(home.price)}</span>{' '}
              <span className="text-muted-foreground">night</span>
            </p>
            <dl className="mt-5 space-y-3 border-t pt-5 text-sm">
              <div className="flex gap-3">
                <dt className="sr-only">Location</dt>
                <MapPin className="size-4 shrink-0 translate-y-0.5 text-muted-foreground" aria-hidden />
                <dd className="break-words">{home.location}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">Category</dt>
                {CategoryIcon && <CategoryIcon className="size-4 shrink-0 translate-y-0.5 text-muted-foreground" aria-hidden />}
                <dd>{home.title}</dd>
              </div>
            </dl>
            <div className="mt-5 border-t pt-5">
              <h2 className="mb-4 font-semibold">Reserve</h2>
              <ReservationForm homeId={home.id} price={home.price} />
            </div>
            {bookedDates.length > 0 && (
              <div className="mt-5 border-t pt-5 text-sm">
                <h3 className="font-medium">Already booked</h3>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {bookedDates.map((stay) => (
                    <li key={`${stay.checkIn.toISOString()}-${stay.checkOut.toISOString()}`}>
                      {formatStayDates(stay.checkIn, stay.checkOut)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>

        <section aria-labelledby="about-heading" className="border-t pt-8 lg:col-start-1">
          <h2 id="about-heading" className="text-xl font-semibold">About this home</h2>
          <p className="mt-3 max-w-prose whitespace-pre-line leading-relaxed break-words">{home.description}</p>
        </section>
      </div>
    </article>
  );
}

export default HomeDetailsPage;
