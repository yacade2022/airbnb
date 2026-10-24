'use client'

import { useTransition } from 'react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { logoutUser } from '@/utils/authActions'

// Calls the action directly: a <form> inside the menu would unmount as the menu closes, before it submits
function LogoutItem() {
  const [pending, startTransition] = useTransition()
  return (
    <DropdownMenuItem
      className='min-h-11'
      disabled={pending}
      onSelect={() => startTransition(() => logoutUser())}
    >
      {pending ? 'Logging out…' : 'Log out'}
    </DropdownMenuItem>
  )
}

export default LogoutItem
