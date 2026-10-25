'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Form from 'next/form'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { fromDateInput, localToday, parseDateInput, toDateInput } from '@/lib/reservationRules'
import { cn } from '@/lib/utils'

type DateField = 'checkIn' | 'checkOut'

// How far ahead the date picker lets visitors browse
const SEARCH_WINDOW_MONTHS = 12

// Two months side by side only where the header has room for them
const TWO_MONTHS_QUERY = '(min-width: 1024px)'

// The picker's dates are local calendar dates, so they're formatted in the visitor's own time zone
const shortDateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

type SearchFormProps = {
  defaultQuery?: string
  defaultCheckIn?: string
  defaultCheckOut?: string
  filter?: string | null
  className?: string
}

// Searches homes by location or description, with optional dates; a GET form so results have a shareable URL
export function SearchForm({
  defaultQuery = '',
  defaultCheckIn = '',
  defaultCheckOut = '',
  filter,
  className,
}: SearchFormProps) {
  return (
    <Form action='/' role='search' className={className}>
      {/* Keeps the selected category when searching */}
      {filter && <input type='hidden' name='filter' value={filter} />}
      <SearchBar
        // key refreshes the bar when the URL changes (e.g. after "Clear filters")
        key={`${defaultQuery}|${defaultCheckIn}|${defaultCheckOut}`}
        defaultQuery={defaultQuery}
        defaultCheckIn={defaultCheckIn}
        defaultCheckOut={defaultCheckOut}
      />
    </Form>
  )
}

type SearchBarProps = { defaultQuery: string; defaultCheckIn: string; defaultCheckOut: string }

// One rounded bar: location, check-in and check-out segments, then the search button.
// The date segments open a range calendar below the bar
function SearchBar({ defaultQuery, defaultCheckIn, defaultCheckOut }: SearchBarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<DateField>()
  const [checkIn, setCheckIn] = useState(parseDateInput(defaultCheckIn) ? defaultCheckIn : '')
  const [checkOut, setCheckOut] = useState(
    parseDateInput(defaultCheckIn) && parseDateInput(defaultCheckOut) && defaultCheckOut > defaultCheckIn
      ? defaultCheckOut
      : ''
  )
  // Empty until mounted: the server doesn't know the visitor's time zone
  const [today, setToday] = useState<string>()
  const twoMonths = useMediaQuery(TWO_MONTHS_QUERY)

  useEffect(() => setToday(localToday()), [])

  // Closes the calendar on a click outside the bar or Escape
  useEffect(() => {
    if (!active) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setActive(undefined)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(undefined)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [active])

  // Picking check-in moves on to check-out; picking a check-out after check-in completes the range.
  // A day on or before check-in while choosing check-out starts the range again from that day
  const handleDayClick = (date: Date) => {
    const day = toDateInput(date)
    if (active === 'checkOut' && checkIn && day > checkIn) {
      setCheckOut(day)
      setActive(undefined)
      return
    }
    setCheckIn(day)
    if (active === 'checkIn' && checkOut > day) {
      setActive(undefined)
    } else {
      setCheckOut('')
      setActive('checkOut')
    }
  }

  const clearDates = () => {
    setCheckIn('')
    setCheckOut('')
    setActive('checkIn')
  }

  const toggle = (field: DateField) => setActive((current) => (current === field ? undefined : field))

  const startMonth = today ? fromDateInput(today) : undefined
  const endMonth = startMonth
    ? new Date(startMonth.getFullYear(), startMonth.getMonth() + SEARCH_WINDOW_MONTHS - 1)
    : undefined

  const prompt = !checkIn
    ? 'Select a check-in date'
    : !checkOut
      ? 'Select a check-out date'
      : `${shortDateFormatter.format(fromDateInput(checkIn))} – ${shortDateFormatter.format(fromDateInput(checkOut))}`

  return (
    <div ref={rootRef} className='relative'>
      {checkIn && checkOut && (
        <>
          <input type='hidden' name='checkIn' value={checkIn} />
          <input type='hidden' name='checkOut' value={checkOut} />
        </>
      )}

      <div
        className={cn(
          'flex h-14 items-center rounded-full border border-input bg-background shadow-sm transition-shadow hover:shadow-md',
          active && 'bg-muted'
        )}
      >
        <label
          className={cn(
            'flex min-w-0 flex-1 cursor-text flex-col justify-center self-stretch rounded-full pl-5 pr-3 transition-colors hover:bg-accent',
            'focus-within:bg-background focus-within:shadow-sm focus-within:hover:bg-background'
          )}
        >
          <span className='text-xs font-semibold'>Location</span>
          <input
            type='search'
            name='q'
            defaultValue={defaultQuery}
            aria-label='Search by location'
            placeholder='Search by location'
            enterKeyHint='search'
            onFocus={() => setActive(undefined)}
            className='w-full truncate bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm [&::-webkit-search-cancel-button]:hidden'
          />
        </label>

        <Divider hidden={Boolean(active)} />
        <DateSegment
          label='Check in'
          value={checkIn}
          active={active === 'checkIn'}
          onClick={() => toggle('checkIn')}
        />
        <Divider hidden={Boolean(active)} />
        <DateSegment
          label='Check out'
          value={checkOut}
          active={active === 'checkOut'}
          onClick={() => toggle('checkOut')}
        />

        <button
          type='submit'
          aria-label='Search'
          className='mx-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition-colors hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
        >
          <Search className='size-4' strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      {active && (
        <div
          id='search-dates'
          role='dialog'
          aria-label='Choose check-in and check-out dates'
          className={cn(
            'absolute inset-x-0 top-full z-50 mt-3 rounded-3xl border bg-background p-4 shadow-xl sm:p-6',
            'md:left-auto md:w-[22rem] lg:w-[42rem]'
          )}
        >
          <div className='mb-4 flex min-h-9 items-center justify-between gap-3'>
            <p aria-live='polite' className='text-sm font-semibold'>
              {prompt}
            </p>
            {checkIn && (
              <button
                type='button'
                onClick={clearDates}
                className='-mr-2 min-h-9 shrink-0 rounded-full px-3 text-sm font-medium underline underline-offset-4 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50'
              >
                Clear dates
              </button>
            )}
          </div>
          <Calendar
            mode='range'
            defaultMonth={checkIn ? fromDateInput(checkIn) : startMonth}
            startMonth={startMonth}
            endMonth={endMonth}
            numberOfMonths={twoMonths ? 2 : 1}
            selected={{
              from: checkIn ? fromDateInput(checkIn) : undefined,
              to: checkOut ? fromDateInput(checkOut) : undefined,
            }}
            onSelect={(_range, triggerDate) => handleDayClick(triggerDate)}
            disabled={(date) => !today || toDateInput(date) < today}
            classNames={{
              months: 'relative flex flex-col gap-8 sm:flex-row',
              selected: '[&>button]:bg-brand [&>button]:text-brand-foreground [&>button]:hover:bg-brand/90',
              // The band between the two dates; DayPicker only sets these once both dates are chosen
              range_start: 'rounded-l-full bg-brand-soft',
              range_end: 'rounded-r-full bg-brand-soft',
              range_middle:
                'bg-brand-soft [&>button]:!bg-transparent [&>button]:!text-foreground [&>button]:hover:!bg-accent',
            }}
          />
        </div>
      )}
    </div>
  )
}

// A thin divider between segments, faded out while a date segment is raised
function Divider({ hidden }: { hidden: boolean }) {
  return <span aria-hidden className={cn('h-7 w-px shrink-0 bg-border transition-opacity', hidden && 'opacity-0')} />
}

type DateSegmentProps = { label: string; value: string; active: boolean; onClick: () => void }

function DateSegment({ label, value, active, onClick }: DateSegmentProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-expanded={active}
      aria-controls={active ? 'search-dates' : undefined}
      aria-haspopup='dialog'
      className={cn(
        'flex w-[5.5rem] shrink-0 flex-col justify-center self-stretch rounded-full px-3 text-left outline-none transition-colors sm:w-28 sm:px-4',
        'hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/30',
        active && 'bg-background shadow-sm hover:bg-background'
      )}
    >
      <span className='text-xs font-semibold'>{label}</span>
      <span className={cn('truncate text-sm', value ? 'text-foreground' : 'text-muted-foreground')}>
        {value ? shortDateFormatter.format(fromDateInput(value)) : 'Add date'}
      </span>
    </button>
  )
}

function NavSearch({ className }: { className?: string }) {
  const searchParams = useSearchParams()
  return (
    <SearchForm
      defaultQuery={searchParams.get('q') ?? ''}
      defaultCheckIn={searchParams.get('checkIn') ?? ''}
      defaultCheckOut={searchParams.get('checkOut') ?? ''}
      filter={searchParams.get('filter')}
      className={className}
    />
  )
}

export default NavSearch
