import React from 'react'
import Link from 'next/link'

function AddHome() {
  return (
    <Link href='/addHomeToList' className='font-medium'>
      Airbnb your home
    </Link>
  )
}

export default AddHome
