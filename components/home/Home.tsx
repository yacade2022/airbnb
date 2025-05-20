import { fetchAllHome } from '@/utils/actions'
import Image from 'next/image';

async function Home() {
  const homes = await fetchAllHome();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 py-8">
      {homes.map((item) => (
        <article className="flex flex-col gap-2" key={item.id}>
          <div className="aspect-square relative overflow-hidden rounded-xl w-full">
            <Image 
              src={item.photo} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              alt={`Photo of ${item.id}`} 
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
          <div className="mt-2">
            <h3 className="font-medium text-base">{item.location || 'Location'}</h3>
            <p className="text-gray-500 text-sm">{item.title || 'categorie'}</p>
            <p className="text-gray-500 text-sm">{item.description || 'Description'}</p>
            <p className="mt-1"><span className="font-semibold">${item.price || '100'}</span> night</p>
          </div>
        </article>
      ))}
    </div>
  )
}

export default Home