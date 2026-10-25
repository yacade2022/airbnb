import Category from '@/components/categorItem/Category'
import Home from '@/components/home/Home'
import IntroBanner from '@/components/home/IntroBanner'
import LoadingContainer from '@/components/global/LoadingContainer'
import { categoryHouses } from '@/lib/categoryHouses'
import { parseDateInput } from '@/lib/reservationRules'
import React, { Suspense } from 'react'

type HomePageProps = {
  searchParams: Promise<{ filter?: string; q?: string; checkIn?: string; checkOut?: string }>
}

async function HomePage({ searchParams }: HomePageProps) {
  const { filter, q, checkIn, checkOut } = await searchParams
  const category = categoryHouses.find((item) => item.id.toString() === filter)?.title
  const search = q?.trim() || undefined
  // Dates only filter when both are valid and in order; anything else is ignored
  const inDate = parseDateInput(checkIn)
  const outDate = parseDateInput(checkOut)
  const dates = inDate && outDate && outDate > inDate ? { checkIn: inDate, checkOut: outDate } : undefined

  return (
    <div>
      {category || search || dates ? <h1 className='sr-only'>Find a place to stay</h1> : <IntroBanner />}
      <Suspense fallback={<div className='h-[88px]' />}>
        <Category />
      </Suspense>
      {/* key re-triggers the loading state when the filter, search or dates change */}
      <Suspense
        key={`${category ?? 'all'}|${search ?? ''}|${dates ? `${checkIn}|${checkOut}` : ''}`}
        fallback={<LoadingContainer />}
      >
        <Home category={category} search={search} dates={dates} />
      </Suspense>
    </div>
  )
}

export default HomePage
