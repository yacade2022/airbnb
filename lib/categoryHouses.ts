import {
  Building2,
  Grape,
  Landmark,
  Mountain,
  MountainSnow,
  Sailboat,
  Sun,
  Tractor,
  TreePalm,
  Trees,
  Umbrella,
  Waves,
  type LucideIcon,
} from 'lucide-react'

type categoryItem = {
  id: number;
  name: string;
  description: string;
  title: string;
  icon: LucideIcon;
}

export const categoryHouses: categoryItem[] = [
  {
    id: 1,
    name: "LakeFront",
    description: "Stunning lakefront property with panoramic water views and private dock access.",
    title: "Lake",
    icon: Waves,
  },
  {
    id: 2,
    name: "MountainView",
    description: "Cozy cabin retreat with breathtaking mountain vistas and outdoor hot tub.",
    title: "Mountain",
    icon: Mountain,
  },
  {
    id: 3,
    name: "CityLoft",
    description: "Modern downtown loft with floor-to-ceiling windows and skyline views.",
    title: "Urban",
    icon: Building2,
  },
  {
    id: 4,
    name: "BeachHouse",
    description: "Oceanfront paradise with private beach access and spectacular sunset views.",
    title: "Beach",
    icon: Umbrella,
  },
  {
    id: 5,
    name: "VineyardEstate",
    description: "Luxurious estate surrounded by rolling vineyards with wine cellar and pool.",
    title: "Vineyard",
    icon: Grape,
  },
  {
    id: 6,
    name: "DesertRetreat",
    description: "Modern oasis in the desert with infinity pool and dramatic landscape views.",
    title: "Desert",
    icon: Sun,
  },
  {
    id: 7,
    name: "TropicalVilla",
    description: "Exotic paradise with lush gardens, infinity pool, and tropical beach access.",
    title: "Tropical",
    icon: TreePalm,
  },
  {
    id: 8,
    name: "HistoricTownhouse",
    description: "Elegant restored townhouse with original architecture and modern amenities.",
    title: "Historic",
    icon: Landmark,
  },
  {
    id: 9,
    name: "ForestCabin",
    description: "Secluded woodland retreat with wraparound deck and towering pine trees.",
    title: "Forest",
    icon: Trees,
  },
  {
    id: 10,
    name: "ModernFarmhouse",
    description: "Stylish countryside home with rustic charm, chef's kitchen, and rolling pastures.",
    title: "Farmhouse",
    icon: Tractor,
  },
  {
    id: 11,
    name: "SkiChalet",
    description: "Luxury mountain lodge with ski-in/ski-out access and panoramic alpine views.",
    title: "Ski",
    icon: MountainSnow,
  },
  {
    id: 12,
    name: "IslandBungalow",
    description: "Charming waterfront bungalow with private pier and spectacular island views.",
    title: "Island",
    icon: Sailboat,
  },
]

export const findCategoryByTitle = (title: string) =>
  categoryHouses.find((item) => item.title === title)
