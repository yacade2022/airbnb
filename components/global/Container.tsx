import React from 'react'

function Container({children}:{children:React.ReactNode}) {
  return (
    <div className=' mx-auto max-w-6xl xl:max-w-7xl px-8'>
        {children}
    </div>
  )
}

export default Container