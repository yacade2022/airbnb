'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/form/Button';
import { createReservation, type ReservationField, type ReservationState } from '@/utils/actions';
import { MAX_GUESTS, MAX_NIGHTS, addDays, localToday, nightsBetween, parseDateInput } from '@/lib/reservationRules';
import { formatPrice } from '@/lib/format';

const initialState: ReservationState = {};

type ReservationFormProps = {
  homeId: string;
  price: number;
};

function ReservationForm({ homeId, price }: ReservationFormProps) {
  const [state, formAction] = useActionState(createReservation, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  // Empty until mounted: the server doesn't know the visitor's time zone
  const [today, setToday] = useState<string>();

  useEffect(() => setToday(localToday()), []);

  // After a failed submission: restore the dates React reset, and focus the field with the error
  useEffect(() => {
    setCheckIn(state.values?.checkIn ?? '');
    setCheckOut(state.values?.checkOut ?? '');
    if (state.field) {
      const field = formRef.current?.elements.namedItem(state.field);
      if (field instanceof HTMLElement) field.focus();
    }
  }, [state]);

  const inDate = parseDateInput(checkIn);
  const outDate = parseDateInput(checkOut);
  const nights = inDate && outDate ? nightsBetween(inDate, outDate) : 0;
  // Check-out must be at least the night after check-in
  const minCheckOut = inDate ? addDays(inDate, 1).toISOString().slice(0, 10) : today;

  const fieldError = (field: ReservationField) => (state.field === field ? state.error : undefined);
  const invalidProps = (field: ReservationField) =>
    fieldError(field) ? { 'aria-invalid': true, 'aria-describedby': 'reservation-error' } : {};

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="homeId" value={homeId} />
      {state.error && (
        <p id="reservation-error" role="alert" className="flex items-start gap-2 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-2" htmlFor="checkIn">Check-in</Label>
          <Input
            id="checkIn"
            type="date"
            name="checkIn"
            value={checkIn}
            min={today}
            onChange={(event) => setCheckIn(event.currentTarget.value)}
            required
            className="h-11"
            {...invalidProps('checkIn')}
          />
        </div>
        <div>
          <Label className="mb-2" htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            type="date"
            name="checkOut"
            value={checkOut}
            min={minCheckOut}
            onChange={(event) => setCheckOut(event.currentTarget.value)}
            required
            className="h-11"
            {...invalidProps('checkOut')}
          />
        </div>
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
