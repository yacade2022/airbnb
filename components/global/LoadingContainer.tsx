import { Skeleton } from '../ui/skeleton';
import { homesGridClass } from '../home/HomeCard';

function LoadingContainer() {
  return (
    <div role='status' aria-busy='true' className='pb-16 pt-2'>
      <span className='sr-only'>Loading homes…</span>
      <Skeleton className='mb-6 h-6 w-32' />
      <div className={homesGridClass}>
        {Array.from({ length: 8 }, (_, index) => (
          <LoadingProduct key={index} />
        ))}
      </div>
    </div>
  );
}

function LoadingProduct() {
  return (
    <div aria-hidden>
      <Skeleton className='aspect-[4/3] w-full rounded-xl' />
      <Skeleton className='mt-3 h-4 w-2/3' />
      <Skeleton className='mt-2 h-4 w-full' />
      <Skeleton className='mt-2 h-4 w-1/3' />
    </div>
  );
}
export default LoadingContainer;
