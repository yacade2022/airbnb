"use client";

import { useEffect, useRef } from "react";
import { categoryHouses } from "@/lib/categoryHouses";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const itemClass =
  "flex min-h-14 min-w-14 shrink-0 flex-col items-center justify-center gap-1.5 border-b-2 border-transparent px-1 pb-2 pt-1 text-muted-foreground transition-colors hover:border-border hover:text-foreground aria-[current=page]:border-foreground aria-[current=page]:text-foreground";

export default function Category() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("filter");
  const query = searchParams.get("q");
  const activeRef = useRef<HTMLAnchorElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Keeps the selected category visible when the list is scrolled sideways on small screens.
  // Scrolls only the list: scrollIntoView() would also move the page and the keyboard Tab start point
  useEffect(() => {
    const item = activeRef.current?.getBoundingClientRect();
    const list = listRef.current;
    if (!item || !list) return;
    const bounds = list.getBoundingClientRect();
    if (item.left < bounds.left || item.right > bounds.right) {
      list.scrollLeft += item.left - bounds.left - 16;
    }
  }, [search]);

  // Switching category keeps the current search and dates
  const hrefFor = (filter?: string) => {
    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);
    if (query) params.set("q", query);
    for (const key of ["checkIn", "checkOut"]) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav aria-label="Categories" className="relative -mx-4 sm:-mx-8 lg:mx-0">
      <ul ref={listRef} className="flex gap-x-6 overflow-x-auto scrollbar-hide px-4 pt-4 sm:gap-x-8 sm:px-8 lg:px-0 xl:justify-between">
        <li>
          <Link
            href={hrefFor()}
            aria-current={!search ? "page" : undefined}
            ref={!search ? activeRef : undefined}
            className={itemClass}
          >
            <LayoutGrid className="size-6" aria-hidden />
            <span className="text-xs font-medium">All</span>
          </Link>
        </li>
        {categoryHouses.map((item) => {
          const isActive = search === item.id.toString();
          const Icon = item.icon;

          return (
            <li key={item.id}>
              <Link
                // Clicking the active category clears the filter
                href={hrefFor(isActive ? undefined : item.id.toString())}
                aria-current={isActive ? "page" : undefined}
                ref={isActive ? activeRef : undefined}
                className={itemClass}
              >
                <Icon className="size-6" aria-hidden />
                <span className={cn("text-xs", isActive ? "font-semibold" : "font-medium")}>{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Hints that the row scrolls sideways when it overflows */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background xl:hidden" aria-hidden />
      <div className="mb-6 border-b" />
    </nav>
  );
}
