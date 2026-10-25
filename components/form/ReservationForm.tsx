'use client';

import { useActionState, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { CircleAlert } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { SubmitButton } from '@/components/form/Button';
import { createReservation, type ReservationField, type ReservationState } from '@/utils/actions';
import {
  MAX_GUESTS,
  MAX_NIGHTS,
  type BookedStay,
  fromDateInput,
  isNightBooked,
  latestCheckOut,
  localToday,
  nightsBetween,
  overlapsBookedStay,
  parseDateInput,
  toDateInput,
} from '@/lib/reservationRules';
import { formatPrice, formatStayDate } from '@/lib/format';
import { cn } from '@/lib/utils';

// How far ahead the calendar lets visitors browse
const BOOKING_WINDOW_MONTHS = 12;

// Two months side by side only where the booking card is wide: tablets, before it moves into the sidebar
const TWO_MONTHS_QUERY = '(min-width: 640px) and (max-width: 1023px)';

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

type ReservationFormProps = {
  homeId: string;
  price: number;
  bookedStays: BookedStay[];
  isLoggedIn: boolean;
  // Dates and guests to start with, e.g. restored after logging in to book
  initialValues?: ReservationState['values'];
};

function ReservationForm({ homeId, price, bookedStays, isLoggedIn, initialValues }: ReservationFormProps) {
  const [state, formAction] = useActionState(createReservation, { values: initialValues });
  const calendarRef = useRef<HTMLDivElement>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [clientError, setClientError] = useState<{ error: string; field: ReservationField }>();
  // Empty until mounted: the server doesn't know the visitor's time zone
  const [today, setToday] = useState<string>();
  const twoMonths = useMediaQuery(TWO_MONTHS_QUERY);

  useEffect(() => setToday(localToday()), []);

  // After a failed submission: restore the dates React reset, and focus the field with the error
  useEffect(() => {
    setCheckIn(state.values?.checkIn ?? '');
    setCheckOut(state.values?.checkOut ?? '');
    setClientError(undefined);
    focusField(state.field);
  }, [state]);

  function focusField(field?: ReservationField) {
    if (field === 'checkIn' || field === 'checkOut') calendarRef.current?.focus();
    else if (field) document.getElementById(field)?.focus();
  }

  const inDate = parseDateInput(checkIn);
  const outDate = parseDateInput(checkOut);
  const nights = inDate && outDate ? nightsBetween(inDate, outDate) : 0;
  // While picking a check-out, nothing past the next booked night (or the stay limit) can be chosen
  const choosingCheckOut = Boolean(checkIn && !checkOut);
  const maxCheckOut = choosingCheckOut ? latestCheckOut(checkIn, bookedStays) : undefined;

  const isDayDisabled = (date: Date) => {
    const day = toDateInput(date);
    if (!today || day < today) return true;
    if (maxCheckOut && day > checkIn) return day > maxCheckOut;
    return isNightBooked(day, bookedStays);
  };

  // First click picks check-in, second picks check-out. Clicking a day on or before check-in,
  // or any day once both are set, starts a new range from that day
  const handleDayClick = (date: Date) => {
    const day = toDateInput(date);
    setClientError(undefined);
    if (choosingCheckOut && day > checkIn) {
      setCheckOut(day);
    } else {
      setCheckIn(day);
      setCheckOut('');
    }
  };

  const clearDates = () => {
    setCheckIn('');
    setCheckOut('');
    setClientError(undefined);
  };

  // Catches an incomplete range before it reaches the server, which still validates everything
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Logged-out visitors go straight to the server, which sends them to log in with their choices kept
    if (!isLoggedIn) return;
    let error: typeof clientError;
    if (!checkIn) error = { error: 'Please choose a check-in date.', field: 'checkIn' };
    else if (!checkOut) error = { error: 'Please choose a check-out date.', field: 'checkOut' };
    else if (overlapsBookedStay(checkIn, checkOut, bookedStays)) {
      error = { error: 'Those dates are already booked. Please choose different dates.', field: 'checkIn' };
    }
    if (error) {
      event.preventDefault();
      setClientError(error);
      focusField(error.field);
    }
  };

  const shown = clientError ?? (state.error ? { error: state.error, field: state.field } : undefined);
  const invalidProps = (field: ReservationField) =>
    shown?.field === field ? { 'aria-invalid': true, 'aria-describedby': 'reservation-error' } : {};
  const datesInvalid = shown?.field === 'checkIn' || shown?.field === 'checkOut';

  const startMonth = today ? fromDateInput(today) : undefined;
  const endMonth = startMonth
    ? new Date(startMonth.getFullYear(), startMonth.getMonth() + BOOKING_WINDOW_MONTHS - 1)
    : undefined;

  const prompt = !checkIn
    ? 'Select a check-in date.'
    : !checkOut
      ? 'Select a check-out date.'
      : `${nights} ${nights === 1 ? 'night' : 'nights'} selected.`;

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="homeId" value={homeId} />
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />
      {shown && (
        <p id="reservation-error" role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {shown.error}
        </p>
      )}

      {/* Summary of the chosen range; the calendar below is where dates are picked */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border text-sm">
        <div className={cn('px-3 py-2', !checkIn && 'bg-muted/40')}>
          <p className="text-xs font-semibold uppercase tracking-wide">Check-in</p>
          <p className={cn('mt-0.5', !checkIn && 'text-muted-foreground')}>
            {inDate ? formatStayDate(inDate) : 'Add date'}
          </p>
        </div>
        <div className={cn('border-l px-3 py-2', !checkOut && 'bg-muted/40')}>
          <p className="text-xs font-semibold uppercase tracking-wide">Check-out</p>
          <p className={cn('mt-0.5', !checkOut && 'text-muted-foreground')}>
            {outDate ? formatStayDate(outDate) : 'Add date'}
          </p>
        </div>
      </div>

      <div
        ref={calendarRef}
        tabIndex={-1}
        role="group"
        aria-label="Choose check-in and check-out dates"
        className={cn(
          'rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
          datesInvalid && 'ring-2 ring-destructive/40'
        )}
        {...(datesInvalid && { 'aria-describedby': 'reservation-error' })}
      >
        <Calendar
          mode="range"
          // Remounting when the restored dates change keeps the shown month on the selection
          key={state.values?.checkIn}
          defaultMonth={inDate ? fromDateInput(checkIn) : startMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          numberOfMonths={twoMonths ? 2 : 1}
          selected={{ from: inDate && fromDateInput(checkIn), to: outDate && fromDateInput(checkOut) }}
          onSelect={(_range, triggerDate) => handleDayClick(triggerDate)}
          disabled={isDayDisabled}
          modifiers={{ booked: (date) => isNightBooked(toDateInput(date), bookedStays) }}
          modifiersClassNames={{ booked: '[&>button]:line-through' }}
          classNames={{
            selected: '[&>button]:bg-brand [&>button]:text-brand-foreground [&>button]:hover:bg-brand/90',
            // The band between the two dates; DayPicker only sets these once both dates are chosen
            range_start: 'rounded-l-full bg-brand-soft',
            range_end: 'rounded-r-full bg-brand-soft',
            range_middle:
              'bg-brand-soft [&>button]:!bg-transparent [&>button]:!text-foreground [&>button]:hover:!bg-accent',
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <p aria-live="polite" className="text-muted-foreground">
          {prompt}
          {bookedStays.length > 0 && <span className="block text-xs">Crossed-out dates are booked.</span>}
        </p>
        {checkIn && (
          <button
            type="button"
            onClick={clearDates}
            className="-mr-2 min-h-11 shrink-0 rounded-md px-2 font-medium underline underline-offset-4 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            Clear dates
          </button>
        )}
      </div>

      <div>
        <Label className="mb-2" htmlFor="guests">Guests</Label>
        <Input
          id="guests"
          type="number"
          name="guests"
          inputMode="numeric"
          min={1}
          max={MAX_GUESTS}
          step={1}
          // key re-applies the restored value after React resets the form
          key={state.values?.guests}
          defaultValue={state.values?.guests ?? '1'}
          required
          className="h-11"
          {...invalidProps('guests')}
        />
      </div>

      {/* Estimate only; the server recalculates the total from the stored price */}
      <div aria-live="polite" className="text-sm">
        {nights > 0 && nights <= MAX_NIGHTS ? (
          <div className="flex justify-between gap-4 border-t pt-4">
            <span className="text-muted-foreground">
              {formatPrice(price)} × {nights} {nights === 1 ? 'night' : 'nights'}
            </span>
            <span className="font-semibold">{formatPrice(price * nights)}</span>
          </div>
        ) : (
          <p className="text-muted-foreground">Choose dates to see the total.</p>
        )}
      </div>

      <SubmitButton text="Reserve" variant="brand" className="h-11 w-full" />
    </form>
  );
}

export default ReservationForm;
