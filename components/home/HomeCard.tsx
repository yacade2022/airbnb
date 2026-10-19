import Image from 'next/image'
import Link from 'next/link'
import type { Home } from '@prisma/client'
import { findCategoryByTitle } from '@/lib/categoryHouses'
import { formatPrice } from '@/lib/format'

// Shared with the loading skeleton so it matches the real grid
export const homesGridClass = 'grid grid-cols-1 gap-x-6 gap-y-10 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

type HomeCardProps = {
  home: Home
  priority?: boolean
}

function HomeCard({ home, priority = false }: HomeCardProps) {
  const Icon = findCategoryByTitle(home.title)?.icon

  return (
    // has-[]: shows the link's keyboard focus around the whole card
    <article className='group relative rounded-xl has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-4'>
      <div className='relative aspect-[4/3] overflow-hidden rounded-xl bg-muted'>
        <Image
          src={home.photo}
          fill
          sizes='(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 480px) 50vw, 100vw'
          alt={`${home.title} home in ${home.location}`}
          className='object-cover transition-transform duration-300 group-hover:scale-[1.03]'
          priority={priority}
        />
        <span className='absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium shadow-sm'>
          {Icon && <Icon className='size-3.5' aria-hidden />}
          {home.title}
        </span>
      </div>
      <div className='mt-3 space-y-1'>
        <h3 className='font-semibold leading-snug break-words'>
          {/* The ::after overlay makes the whole card the click target */}
          <Link href={`/homes/${home.id}`} className='after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none'>
            {home.location}
          </Link>
        </h3>
        <p className='line-clamp-2 text-sm text-muted-foreground break-words'>{home.description}</p>
        <p className='pt-1 text-sm'>
          <span className='font-semibold'>{formatPrice(home.price)}</span> <span className='text-muted-foreground'>night</span>
        </p>
      </div>
    </article>
  )
}

export default HomeCard
