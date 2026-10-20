import { fetchAllHome, fetchFavoriteIds } from '@/utils/actions'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/global/EmptyState';
import HomeCard, { homesGridClass } from './HomeCard';

async function Home({ category, search }: { category?: string; search?: string }) {
  let homes: Awaited<ReturnType<typeof fetchAllHome>>;
  let favoriteIds: Set<string>;
  try {
    [homes, favoriteIds] = await Promise.all([fetchAllHome(category, search), fetchFavoriteIds()]);
  } catch (error) {
    // Handled here so a database failure doesn't take down the whole page
    console.error('Error fetching homes:', error);
    return (
      <div role="alert" className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-xl font-semibold">We couldn&apos;t load homes right now</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please check your connection and try again.</p>
        <Button asChild variant="outline" className="mt-6 h-11 px-5">
          {/* A real link (not router.refresh) so it works without JavaScript too */}
          <a href="">Try again</a>
        </Button>
      </div>
    );
  }

  const isFiltered = Boolean(category || search);

  if (homes.length === 0) {
    if (!isFiltered) {
      return (
        <EmptyState title="No homes listed yet" description="Be the first to share a place to stay.">
          <Button asChild variant="brand" className="h-11 px-5">
            <Link href="/addHomeToList">Airbnb your home</Link>
          </Button>
        </EmptyState>
      );
    }
    return (
      <EmptyState
        title="No matching homes"
        description={
          search
            ? `Nothing matches “${search}”${category ? ` in ${category}` : ''}. Try a different place name or category.`
            : `There are no ${category} homes yet. Try another category or browse everything.`
        }
      >
        <Button asChild variant="outline" className="h-11 px-5">
          <Link href="/">Show all homes</Link>
        </Button>
      </EmptyState>
    );
  }

  const count = `${homes.length} ${homes.length === 1 ? 'home' : 'homes'}`;

  return (
    <section aria-labelledby="results-heading" className="pb-16 pt-2">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {/* aria-live announces the new count after filtering or searching */}
        <h2 id="results-heading" aria-live="polite" className="text-lg font-semibold">
          {category ? `${count} in ${category}` : count}
          {search && <span className="font-normal text-muted-foreground"> matching “{search}”</span>}
        </h2>
        {isFiltered && (
          <Link href="/" className="-my-3 inline-block py-3 text-sm font-medium underline underline-offset-4 hover:text-brand">
            Clear filters
          </Link>
        )}
      </div>
      <div className={homesGridClass}>
        {homes.map((home, index) => (
          // Only the first row is above the fold
          <HomeCard key={home.id} home={home} isFavorite={favoriteIds.has(home.id)} priority={index < 4} />
        ))}
      </div>
    </section>
  )
}

export default Home
