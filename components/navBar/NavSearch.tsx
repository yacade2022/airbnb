'use client'

import Form from 'next/form'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type SearchFormProps = {
  defaultQuery?: string
  filter?: string | null
  className?: string
}

// Searches homes by location or description; a GET form so results have a shareable URL
export function SearchForm({ defaultQuery = '', filter, className }: SearchFormProps) {
  return (
    <Form action='/' role='search' className={cn('relative', className)}>
      {/* Keeps the selected category when searching */}
      {filter && <input type='hidden' name='filter' value={filter} />}
      <input
        // key refreshes the box when the URL changes (e.g. after "Clear filters")
        key={defaultQuery}
        type='search'
        name='q'
        defaultValue={defaultQuery}
        aria-label='Search by location'
        placeholder='Search by location'
        enterKeyHint='search'
        className='h-11 w-full rounded-full border border-input bg-background pl-4 pr-12 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 md:text-sm'
      />
      <button
        type='submit'
        aria-label='Search'
        className='absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-brand-foreground transition-colors hover:bg-brand/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
      >
        <Search className='size-4' aria-hidden />
      </button>
    </Form>
  )
}

function NavSearch({ className }: { className?: string }) {
  const searchParams = useSearchParams()
  return (
    <SearchForm
      defaultQuery={searchParams.get('q') ?? ''}
      filter={searchParams.get('filter')}
      className={className}
    />
  )
}

export default NavSearch
