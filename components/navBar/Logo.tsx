import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

function Logo() {
  return (
    // SVGs are rejected by the image optimizer by default, and don't need it
    <Link href='/' aria-label='Airbnb home' className='relative flex h-28 w-28 shrink-0'>
      <Image src='https://www.logo.wine/a/logo/Airbnb/Airbnb-Logo.wine.svg' alt='Airbnb' fill priority unoptimized className='object-contain object-left' />
    </Link>
  )
}

export default Logo
