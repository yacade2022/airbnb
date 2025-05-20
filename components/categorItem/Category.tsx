"use client";

import { categoryHouses } from "@/lib/categoryHouses";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { selectCategory } from "@/utils/actions";

export default function Category() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("filter");

  return (
    <div className="flex gap-x-16 w-full justify-center overflow-x-scroll scrollbar-hide lg:overflow-hidden">
      {categoryHouses.map((item) => {
        const isActive = search === item.id.toString(); 

        return (
          <Link key={item.id} href={`${pathname}?filter=${item.id}`} className="flex flex-col items-center" >
            <div className="relative w-6 h-6">
              <Image src={item.imageUrl} alt="category house" width={24} height={24} />
            </div>
            <p className={`text-xs ${isActive ? "font-bold text-black" : ""}`}>{item.title}</p>
            {isActive && <div className="w-full h-0.5 bg-black rounded-full opacity-80 mt-0.5"></div>} 
          </Link>
        );
      })}
    </div>
  );
}
// "use client";

// import { categoryHouses } from "@/lib/categoryHouses";
// import Link from "next/link";
// import Image from "next/image";
// import { usePathname, useSearchParams } from "next/navigation";
// import { useState, useEffect } from "react";
// import { selectCategory } from "@/utils/actions";

// export default function Category() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const search = searchParams.get("filter");
//   const [selectedCategory, setSelectedCategory] = useState(null);

//   useEffect(() => {
//     const fetchCategory = async () => {
//       if (search) {
//         try {
//           const category = await selectCategory(search);
//           setSelectedCategory(category);
//         } catch (error) {
//           console.error("Error fetching category:", error);
//         }
//       } else {
//         setSelectedCategory(null);
//       }
//     };

//     fetchCategory();
//   }, [search]);

//   return (
//     <div className="flex gap-x-16 w-full justify-center overflow-x-scroll scrollbar-hide lg:overflow-hidden">
//       {categoryHouses.map((item) => {
//         const isActive = search === item.id.toString();

//         return (
//           <Link 
//             key={item.id} 
//             href={`${pathname}?filter=${item.id}`} 
//             className="flex flex-col items-center"
//           >
//             <div className="relative w-6 h-6">
//               <Image 
//                 src={item.imageUrl} 
//                 alt="category house" 
//                 width={24} 
//                 height={24} 
//               />
//             </div>
//             <p className={`text-xs ${isActive ? "font-bold text-black" : ""}`}>
//               {item.title}
//             </p>
//             {isActive && (
//               <div className="w-full h-0.5 bg-black rounded-full opacity-80 mt-0.5"></div>
//             )}
//           </Link>
//         );
//       })}

//       {/* Display selected category details if needed */}
//       {selectedCategory && (
//         <div className="mt-4 p-4 border rounded-md">
//           <h3 className="font-medium">{selectedCategory.title}</h3>
//           {/* Add more details as needed */}
//         </div>
//       )}
//     </div>
//   );
// }