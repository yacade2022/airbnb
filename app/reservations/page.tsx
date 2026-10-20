import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/form/Button';
import EmptyState from '@/components/global/EmptyState';
import { cancelReservation, fetchReservations } from '@/utils/actions';
import { nightsBetween } from '@/lib/reservationRules';
import { formatPrice, formatStayDates } from '@/lib/format';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'My reservations' };

type ReservationsPageProps = {
  searchParams: Promise<{ booked?: string }>;
};

async function ReservationsPage({ searchParams }: ReservationsPageProps) {
  const [{ booked }, reservations] = await Promise.all([searchParams, fetchReservations()]);
  const now = new Date();

  return (
    <section className="py-8 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My reservations</h1>
      <p className="mt-2 text-sm text-muted-foreground">Bookings made on this browser.</p>

      {booked && reservations.some((reservation) => reservation.id === booked) && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success-soft p-4 text-sm text-success"
        >
          <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p><span className="font-semibold">You&apos;re booked.</span> Your reservation is highlighted below.</p>
        </div>
      )}

      {reservations.length === 0 ? (
        <EmptyState title="No reservations yet" description="Open any home, pick your dates, and reserve it.">
          <Button asChild variant="brand" className="h-11 px-5">
            <Link href="/">Browse homes</Link>
          </Button>
        </EmptyState>
      ) : (
        <ul className="mt-8 space-y-4">
          {reservations.map((reservation) => {
            const { home } = reservation;
            const nights = nightsBetween(reservation.checkIn, reservation.checkOut);
            const isPast = reservation.checkOut <= now;

            return (
              <li
                key={reservation.id}
                className={cn(
                  'flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center',
                  reservation.id === booked && 'border-brand/50 ring-2 ring-brand/20',
                  isPast && 'opacity-70'
                )}
              >
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:w-40">
                  <Image src={home.photo} alt="" fill sizes="(min-width: 640px) 160px, 100vw" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold break-words">
                    <Link href={`/homes/${home.id}`} className="hover:underline">{home.location}</Link>
                  </h2>
                  <p className="text-sm text-muted-foreground">{home.title}</p>
                  <p className="mt-2 text-sm">{formatStayDates(reservation.checkIn, reservation.checkOut)}</p>
                  <p className="text-sm text-muted-foreground">
                    {nights} {nights === 1 ? 'night' : 'nights'} · {reservation.guests}{' '}
                    {reservation.guests === 1 ? 'guest' : 'guests'} ·{' '}
                    <span className="font-semibold text-foreground">{formatPrice(reservation.totalPrice)} total</span>
                  </p>
                </div>
                {isPast ? (
                  <span className="text-sm text-muted-foreground">Completed</span>
                ) : (
                  <form action={cancelReservation.bind(null, reservation.id)}>
                    <SubmitButton text="Cancel booking" size="default" variant="outline" className="h-11 w-full sm:w-auto" />
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ReservationsPage;
