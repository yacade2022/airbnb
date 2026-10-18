import { LuAlignLeft } from 'react-icons/lu';
import { Button } from '../ui/button'
import UserIcon from './UserIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

function LinksDropDown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' aria-label='Open menu' className='flex gap-4 max-w-[100px] rounded-3xl'>
          <LuAlignLeft className='w-6 h-6' aria-hidden />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {/* asChild makes the whole item clickable and keyboard-activatable */}
        <DropdownMenuItem asChild>
          <Link href='/addHomeToList'>Airbnb your home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>My Favorites</DropdownMenuItem>
        <DropdownMenuItem>My Reservations</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LinksDropDown
