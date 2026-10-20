'use client'

import { useOptimistic, useTransition } from 'react'
import { FaHeart, FaRegHeart } from "react-icons/fa"
import { Button } from "../ui/button"
import { toggleFavorite } from '@/utils/actions'

type FavoriteButtonProps = {
  homeId: string
  isFavorite: boolean
  className?: string
}

// A form so it also works before JavaScript loads; with JavaScript the heart updates instantly
function FavoriteButton({ homeId, isFavorite, className }: FavoriteButtonProps) {
  const [optimistic, setOptimistic] = useOptimistic(isFavorite)
  const [, startTransition] = useTransition()
  const action = toggleFavorite.bind(null, homeId)

  return (
    <form
      action={action}
      onSubmit={(event) => {
        event.preventDefault()
        startTransition(async () => {
          setOptimistic(!optimistic)
          await action()
        })
      }}
      className={className}
    >
      <Button
        type='submit'
        variant='outline'
        size='icon'
        aria-pressed={optimistic}
        aria-label={optimistic ? 'Remove from favorites' : 'Save to favorites'}
        className='size-11 rounded-full bg-background/95 shadow-sm hover:bg-background'
      >
        {optimistic ? (
          <FaHeart className='size-5 text-brand' aria-hidden />
        ) : (
          <FaRegHeart className='size-5' aria-hidden />
        )}
      </Button>
    </form>
  )
}

export default FavoriteButton
