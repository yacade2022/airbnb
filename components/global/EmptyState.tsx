import Image from 'next/image'
import { imageCredits } from '@/lib/imageCredits'

type EmptyStateProps = {
  // h1 when the empty state is the whole page (e.g. 404), h2 when it sits inside one
  as?: 'h1' | 'h2'
  title: string
  description: string
  children?: React.ReactNode
}

function EmptyState({ as: Heading = 'h2', title, description, children }: EmptyStateProps) {
  const photo = imageCredits.snowyHut

  return (
    <section className='mx-auto flex max-w-md flex-col items-center py-12 text-center sm:py-16'>
      <figure className='w-full max-w-xs'>
        <div className='relative aspect-[3/2] overflow-hidden rounded-2xl bg-muted'>
          {/* Purely decorative here, the heading carries the meaning */}
          <Image src={photo.src} alt='' fill sizes='320px' className='object-cover' />
        </div>
      </figure>
      <Heading className='mt-6 text-xl font-semibold'>{title}</Heading>
      <p className='mt-2 text-sm text-muted-foreground'>{description}</p>
      {children && <div className='mt-6 flex flex-wrap justify-center gap-3'>{children}</div>}
    </section>
  )
}

export default EmptyState
