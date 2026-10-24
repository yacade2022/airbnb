import React, { Suspense } from 'react'
import Logo from './Logo'
import NavSearch, { SearchForm } from './NavSearch'
import AddHome from './AddHome'
import LinksDropDown from './LinksDropDown'
import Container from '../global/Container'
import { unstable_rethrow } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

async function Navbar() {
  // Shown as logged out if the database is unreachable, so the header (and the page) still render
  const user = await getCurrentUser().catch((error) => {
    // Lets Next's own control-flow errors (e.g. "this page is dynamic") through
    unstable_rethrow(error)
    console.error('Error loading the current user:', error)
    return null
  })
  // NavSearch reads the URL, so it needs a Suspense boundary; the fallback is the same form, empty
  const search = (className: string) => (
    <Suspense fallback={<SearchForm className={className} />}>
      <NavSearch className={className} />
    </Suspense>
  )

  return (
    <header className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85'>
      <Container>
        <div className='flex h-16 items-center justify-between gap-4 md:h-20'>
          <Logo />
          {search('hidden md:block w-full max-w-sm')}
          <div className='flex shrink-0 items-center gap-2'>
            <AddHome />
            <LinksDropDown user={user} />
          </div>
        </div>
        <div className='pb-3 md:hidden'>{search('')}</div>
      </Container>
    </header>
  )
}

export default Navbar
