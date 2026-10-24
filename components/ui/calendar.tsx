'use client';

import * as React from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// react-day-picker styled with the app's tokens. Selection colours for ranges are passed in by the
// caller through classNames, since they depend on whether a range is complete
function Calendar({ className, classNames, ...props }: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={false}
      fixedWeeks
      className={cn('w-full', className)}
      classNames={{
        root: cn(defaults.root, 'w-full'),
        months: 'relative flex flex-col gap-6 sm:flex-row',
        month: 'w-full space-y-3',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-30'
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'rounded-full aria-disabled:pointer-events-none aria-disabled:opacity-30'
        ),
        month_caption: 'flex h-9 items-center justify-center',
        caption_label: 'text-sm font-semibold',
        month_grid: 'w-full border-collapse',
        weekday: 'pb-2 text-xs font-medium text-muted-foreground',
        week: 'mt-1',
        day: 'p-0 py-0.5 text-center text-sm',
        day_button: cn(
          'mx-auto flex h-10 w-full max-w-10 items-center justify-center rounded-full font-medium outline-none',
          'transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:font-normal disabled:text-muted-foreground/60 disabled:hover:bg-transparent'
        ),
        today: '[&>button]:underline [&>button]:underline-offset-4',
        outside: 'invisible',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) =>
          orientation === 'left' ? (
            <ChevronLeft className={cn('size-4', chevronClassName)} aria-hidden />
          ) : (
            <ChevronRight className={cn('size-4', chevronClassName)} aria-hidden />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
