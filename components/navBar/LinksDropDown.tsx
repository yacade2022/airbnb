import { LuAlignLeft } from 'react-icons/lu';
import { Button } from '../ui/button'
import UserIcon from './UserIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

// Only links to pages that exist; favorites and reservations need accounts, which aren't built yet
function LinksDropDown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' aria-label='Open menu' className='h-11 gap-3 rounded-full px-3 hover:shadow-md'>
          <LuAlignLeft className='size-5' aria-hidden />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        {/* asChild makes the whole item clickable and keyboard-activatable */}
        <DropdownMenuItem asChild className='min-h-11 font-medium'>
          <Link href='/addHomeToList'>Airbnb your home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className='min-h-11'>
          <Link href='/'>Browse all homes</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className='min-h-11'>
          <Link href='/credits'>Image credits</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LinksDropDown
