import type { ImageCredit } from '@/lib/imageCredits'
import { cn } from '@/lib/utils'

type Credit = Pick<ImageCredit, 'creator' | 'sourceUrl' | 'license' | 'licenseUrl'>

// CC BY attribution shown next to every decorative photo and demo listing photo
function PhotoCredit({ credit, className }: { credit: Credit; className?: string }) {
  return (
    <p className={cn('text-[11px] leading-tight', className)}>
      Illustrative photo:{' '}
      <a href={credit.sourceUrl} target='_blank' rel='noopener noreferrer' className='underline underline-offset-2'>
        {credit.creator}
      </a>
      ,{' '}
      <a href={credit.licenseUrl} target='_blank' rel='noopener noreferrer license' className='underline underline-offset-2'>
        {credit.license}
      </a>
    </p>
  )
}

export default PhotoCredit
