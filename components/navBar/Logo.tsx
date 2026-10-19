import React from 'react'
import Link from 'next/link'
import { House } from 'lucide-react'

// Drawn locally instead of hotlinking the Airbnb trademark logo from a third-party site
function Logo() {
  return (
    <Link href='/' className='flex shrink-0 items-center gap-1.5 text-brand'>
      <House className='size-7' strokeWidth={2.25} aria-hidden />
      <span className='text-xl font-bold tracking-tight'>airbnb</span>
      <span className='sr-only'>, home page</span>
    </Link>
  )
}

export default Logo
