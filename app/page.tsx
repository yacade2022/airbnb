import Category from '@/components/categorItem/Category'
import Home from '@/components/home/Home'
import IntroBanner from '@/components/home/IntroBanner'
import LoadingContainer from '@/components/global/LoadingContainer'
import { categoryHouses } from '@/lib/categoryHouses'
import React, { Suspense } from 'react'

type HomePageProps = {
  searchParams: Promise<{ filter?: string; q?: string }>
}

async function HomePage({ searchParams }: HomePageProps) {
  const { filter, q } = await searchParams
  const category = categoryHouses.find((item) => item.id.toString() === filter)?.title
  const search = q?.trim() || undefined

  return (
    <div>
      {category || search ? <h1 className='sr-only'>Find a place to stay</h1> : <IntroBanner />}
      <Suspense fallback={<div className='h-[88px]' />}>
        <Category />
      </Suspense>
      {/* key re-triggers the loading state when the filter or search changes */}
      <Suspense key={`${category ?? 'all'}|${search ?? ''}`} fallback={<LoadingContainer />}>
        <Home category={category} search={search} />
      </Suspense>
    </div>
  )
}

export default HomePage
