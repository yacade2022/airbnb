import React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

// Visible at every width: on phones it was previously only reachable through the menu
function AddHome() {
  return (
    <Link
      href='/addHomeToList'
      className='inline-flex h-11 items-center gap-1.5 rounded-full border border-brand/40 px-3 text-sm font-medium text-brand transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-4'
    >
      <Plus className='size-4' aria-hidden />
      {/* Icon-only on the narrowest phones (320px) so the header doesn't overflow */}
      <span className='sr-only min-[360px]:not-sr-only sm:hidden'>Add home</span>
      <span className='hidden sm:inline'>Airbnb your home</span>
    </Link>
  )
}

export default AddHome
