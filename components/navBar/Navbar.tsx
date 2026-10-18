import React from 'react'
import Logo from './Logo'
import NavSearch from './NavSearch'
import AddHome from './AddHome'
import LinksDropDown from './LinksDropDown'

import { LuGlobe } from "react-icons/lu"

function Navbar() {
  return (
    <header className='flex items-center justify-between gap-4 border-b'>
      <Logo />
      <div className='hidden md:block flex-1 max-w-xs'>
        <NavSearch />
      </div>
      <div className='flex items-center gap-x-3'>
        <div className='hidden sm:block'>
          <AddHome />
        </div>
        <LuGlobe aria-hidden />
        <LinksDropDown />
      </div>
    </header>
  )
}

export default Navbar
