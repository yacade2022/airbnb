import { LuAlignLeft } from 'react-icons/lu';
import { Button } from '../ui/button'
import UserIcon from './UserIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import  Link  from 'next/link'



function LinksDropDown() {
  return (
    
    <DropdownMenu  >
  <DropdownMenuTrigger asChild>
        <Button variant='outline' className='flex gap-4 max-w-[100px] rounded-3xl'>
          <LuAlignLeft className='w-6 h-6' />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
      <Link href='/addHomeToList'>
      Airbnb your home
      </Link>
    </DropdownMenuItem>    
    <DropdownMenuItem>My Favorites</DropdownMenuItem>
    <DropdownMenuItem>My Reservations</DropdownMenuItem>  
  </DropdownMenuContent>
</DropdownMenu>
   
    

  )
}

export default LinksDropDown