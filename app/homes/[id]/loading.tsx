import { Skeleton } from '@/components/ui/skeleton';

function LoadingHome() {
  return (
    <div role="status" aria-busy="true" className="py-6 pb-16 sm:py-8">
      <span className="sr-only">Loading home…</span>
      <Skeleton className="h-6 w-28" />
      <Skeleton className="mt-6 h-8 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-5 w-48" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <div>
          <Skeleton className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/10]" />
          <Skeleton className="mt-8 h-6 w-40" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default LoadingHome;
