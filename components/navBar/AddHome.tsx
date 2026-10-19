import React from 'react'
import Link from 'next/link'

function AddHome() {
  return (
    <Link
      href='/addHomeToList'
      className='hidden h-10 items-center rounded-full px-4 text-sm font-medium transition-colors hover:bg-accent sm:inline-flex'
    >
      Airbnb your home
    </Link>
  )
}

export default AddHome
