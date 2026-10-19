import Image from 'next/image'
import { imageCredits } from '@/lib/imageCredits'
import PhotoCredit from '@/components/global/PhotoCredit'

function IntroBanner() {
  const photo = imageCredits.cabinExterior

  return (
    <section className='relative mt-4 overflow-hidden rounded-2xl bg-neutral-800 sm:mt-6'>
      <Image
        src={photo.src}
        alt=''
        fill
        priority
        sizes='(min-width: 1280px) 1216px, 100vw'
        className='object-cover object-[center_60%]'
      />
      {/* Darkens the left side so the white text stays readable on any crop */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/5' aria-hidden />
      <div className='relative max-w-lg px-5 pb-12 pt-8 text-white sm:px-10 sm:pb-16 sm:pt-14'>
        <h1 className='text-2xl font-semibold tracking-tight text-balance sm:text-4xl'>Find a place to stay</h1>
        <p className='mt-2 text-sm text-white/90 sm:mt-3 sm:text-base'>
          Browse homes shared by hosts. Pick a category below or search by location.
        </p>
      </div>
      <PhotoCredit credit={photo} className='absolute bottom-2 right-3 text-white/85 [&_a]:text-white' />
    </section>
  )
}

export default IntroBanner
