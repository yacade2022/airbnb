"use client";

import { categoryHouses } from "@/lib/categoryHouses";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

export default function Category() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("filter");

  return (
    <nav aria-label="Categories" className="flex gap-x-10 md:gap-x-16 w-full justify-start lg:justify-center overflow-x-auto scrollbar-hide py-4">
      {categoryHouses.map((item) => {
        const isActive = search === item.id.toString();

        return (
          <Link
            key={item.id}
            // Clicking the active category clears the filter
            href={isActive ? pathname : `${pathname}?filter=${item.id}`}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-col items-center shrink-0 opacity-70 hover:opacity-100 aria-[current=page]:opacity-100"
          >
            <div className="relative w-6 h-6">
              <Image src={item.imageUrl} alt="" width={24} height={24} />
            </div>
            <p className={`text-xs ${isActive ? "font-bold text-black" : ""}`}>{item.title}</p>
            {isActive && <div className="w-full h-0.5 bg-black rounded-full opacity-80 mt-0.5"></div>}
          </Link>
        );
      })}
    </nav>
  );
}
