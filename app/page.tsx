import Category from '@/components/categorItem/Category'
import Home from '@/components/home/Home'
import LoadingContainer from '@/components/global/LoadingContainer'
import { categoryHouses } from '@/lib/categoryHouses'
import React, { Suspense } from 'react'

type HomePageProps = {
  searchParams: Promise<{ filter?: string }>
}

async function HomePage({ searchParams }: HomePageProps) {
  const { filter } = await searchParams
  const category = categoryHouses.find((item) => item.id.toString() === filter)?.title

  return (
    <div>
      <Suspense fallback={null}>
        <Category />
      </Suspense>
      {/* key re-triggers the loading state when the filter changes */}
      <Suspense key={category ?? 'all'} fallback={<LoadingContainer />}>
        <Home category={category} />
      </Suspense>
    </div>
  )
}

export default HomePage
