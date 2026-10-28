import { LuAlignLeft } from 'react-icons/lu';
import { Button } from '../ui/button'
import UserIcon from './UserIcon';
import LogoutItem from './LogoutItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import type { CurrentUser } from '@/lib/auth';

// Favorites and reservations belong to this browser's guest id (lib/guest.ts), with or without an account
function LinksDropDown({ user }: { user: CurrentUser | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' aria-label={user ? `Open menu for ${user.name}` : 'Open menu'} className='h-11 gap-3 rounded-full px-3 hover:shadow-md'>
          <LuAlignLeft className='size-5' aria-hidden />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        {user ? (
          <>
            <DropdownMenuLabel className='truncate font-normal text-muted-foreground'>
              Logged in as <span className='font-medium text-foreground'>{user.name}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            {/* asChild makes the whole item clickable and keyboard-activatable */}
            <DropdownMenuItem asChild className='min-h-11 font-medium'>
              <Link href='/login'>Log in</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className='min-h-11'>
              <Link href='/register'>Sign up</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild className='min-h-11 font-medium'>
          <Link href='/addHomeToList'>Airbnb your home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className='min-h-11'>
          <Link href='/'>Browse all homes</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user && (
          <DropdownMenuItem asChild className='min-h-11'>
            <Link href='/my-listings'>My listings</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild className='min-h-11'>
          <Link href='/favorites'>My Favorites</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className='min-h-11'>
          <Link href='/reservations'>My Reservations</Link>
        </DropdownMenuItem>
        {user?.role === 'ADMIN' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className='min-h-11 font-medium'>
              <Link href='/admin'>Admin dashboard</Link>
            </DropdownMenuItem>
          </>
        )}
        {user && (
          <>
            <DropdownMenuSeparator />
            <LogoutItem />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LinksDropDown
