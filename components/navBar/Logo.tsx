import React from 'react'
import { Button } from '../ui/button'
import  Link  from 'next/link'
import Image from 'next/image'

function Logo() {
  return (
   
<Link href='/' className='relative flex h-28 w-28'>
  <Image src='https://www.logo.wine/a/logo/Airbnb/Airbnb-Logo.wine.svg' alt='Logo' fill priority className=' object-contain object-left' />
</Link>

        
 
  )
}

export default Logo