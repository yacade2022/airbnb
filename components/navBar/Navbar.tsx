import React, { Suspense } from 'react'
import Logo from './Logo'
import NavSearch, { SearchForm } from './NavSearch'
import AddHome from './AddHome'
import LinksDropDown from './LinksDropDown'
import Container from '../global/Container'

function Navbar() {
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
            <LinksDropDown />
          </div>
        </div>
        <div className='pb-3 md:hidden'>{search('')}</div>
      </Container>
    </header>
  )
}

export default Navbar
