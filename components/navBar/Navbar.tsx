import React from 'react'
import Logo from './Logo'
import NavSearch from './NavSearch'
import AddHome from './AddHome'
import LinksDropDown from './LinksDropDown'

import { LuGlobe } from "react-icons/lu"


//i have to add suspence

function Navbar() {
  return (
    <div className=' flex items-center justify-between'>
        <Logo/>
        <NavSearch />
        <div className='flex items-center gap-x-3'>
        <AddHome />
        <LuGlobe />
        
        <LinksDropDown />
        
       
        </div>
        
       
        

    </div>
  )
}

export default Navbar