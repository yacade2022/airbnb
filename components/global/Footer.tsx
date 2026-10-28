import Link from 'next/link'
import Container from './Container'

function Footer() {
  return (
    <footer className='mt-auto border-t bg-muted/40'>
      <Container>
        <div className='py-6 text-sm text-muted-foreground'>
          <nav aria-label='Footer'>
            <ul className='flex flex-wrap gap-x-4 gap-y-2'>
              <li><Link href='/addHomeToList' className='hover:text-foreground hover:underline'>Airbnb your home</Link></li>
              <li><Link href='/favorites' className='hover:text-foreground hover:underline'>My Favorites</Link></li>
              <li><Link href='/reservations' className='hover:text-foreground hover:underline'>My Reservations</Link></li>
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
