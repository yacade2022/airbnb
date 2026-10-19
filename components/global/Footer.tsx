import Link from 'next/link'
import Container from './Container'

function Footer() {
  return (
    <footer className='mt-auto border-t bg-muted/40'>
      <Container>
        <div className='flex flex-col gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <p>Listings are added by hosts. Decorative photos are illustrative only.</p>
          <nav aria-label='Footer'>
            <ul className='flex gap-4'>
              <li><Link href='/addHomeToList' className='hover:text-foreground hover:underline'>Airbnb your home</Link></li>
              <li><Link href='/credits' className='hover:text-foreground hover:underline'>Image credits</Link></li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
