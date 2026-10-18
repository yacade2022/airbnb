import { fetchAllHome } from '@/utils/actions'
import Image from 'next/image';
import Link from 'next/link';

async function Home({ category }: { category?: string }) {
  let homes: Awaited<ReturnType<typeof fetchAllHome>>;
  try {
    homes = await fetchAllHome(category);
  } catch (error) {
    // Handled here so a database failure doesn't take down the whole page
    console.error('Error fetching homes:', error);
    return (
      <div role="alert" className="py-16 text-center">
        <h2 className="text-lg font-semibold">We couldn&apos;t load homes right now</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please refresh the page or try again later.</p>
      </div>
    );
  }

  if (homes.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-semibold">
          {category ? `No ${category} homes yet` : 'No homes listed yet'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {category ? (
            <Link href="/" className="underline">Show all homes</Link>
          ) : (
            <Link href="/addHomeToList" className="underline">Be the first to add your home</Link>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
      {homes.map((item, index) => (
        <article className="flex flex-col gap-2" key={item.id}>
          <div className="aspect-square relative overflow-hidden rounded-xl w-full">
            <Image
              src={item.photo}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              alt={`${item.title} home in ${item.location}`}
              className="object-cover hover:scale-105 transition-transform duration-300"
              // Only the first row is above the fold
              priority={index < 4}
            />
          </div>
          <div className="mt-2">
            <h3 className="font-medium text-base">{item.location}</h3>
            <p className="text-gray-500 text-sm">{item.title}</p>
            <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
            <p className="mt-1"><span className="font-semibold">${item.price}</span> night</p>
          </div>
        </article>
      ))}
    </div>
  )
}

export default Home
