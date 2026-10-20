import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/global/EmptyState';
import HomeCard, { homesGridClass } from '@/components/home/HomeCard';
import { fetchFavoriteHomes } from '@/utils/actions';

export const metadata: Metadata = { title: 'My favorites' };

async function FavoritesPage() {
  const homes = await fetchFavoriteHomes();

  return (
    <section className="py-8 pb-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My favorites</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saved on this browser. Tap the heart on any home to add or remove it.
      </p>

      {homes.length === 0 ? (
        <EmptyState title="No favorites yet" description="Tap the heart on a home you like and it will show up here.">
          <Button asChild variant="brand" className="h-11 px-5">
            <Link href="/">Browse homes</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className={`mt-8 ${homesGridClass}`}>
          {homes.map((home) => (
            <HomeCard key={home.id} home={home} isFavorite />
          ))}
        </div>
      )}
    </section>
  );
}

export default FavoritesPage;
