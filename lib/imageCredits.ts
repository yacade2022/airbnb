// Decorative photos bundled in public/images/demo. They are illustrative only and are
// not photos of any listed property. CC BY 2.0 requires visible attribution, so every
// place that shows one of these renders its credit (see components/global/PhotoCredit.tsx),
// and the full record is listed on /credits. Keep public/images/demo/ATTRIBUTION.md in sync.

export type ImageCredit = {
  src: string;
  alt: string;
  title: string;
  creator: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  width: number;
  height: number;
};

const SHIXART = 'Shixart1985';
const CC_BY_2 = { license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/' };

export const imageCredits = {
  cabinExterior: {
    src: '/images/demo/cabin-exterior.jpg',
    alt: 'A small log cabin with a covered porch, surrounded by tall grass under a blue sky',
    title: 'A wooden cabin sits peacefully amidst tall grass and trees under a bright blue sky',
    creator: SHIXART,
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:A_wooden_cabin_sits_peacefully_amidst_tall_grass_and_trees_under_a_bright_blue_sky.jpg',
    ...CC_BY_2,
    width: 1920,
    height: 1281,
  },
  cabinLivingRoom: {
    src: '/images/demo/cabin-living-room.jpg',
    alt: 'A wood-panelled cabin living room with a blue sofa and a small coffee table',
    title: 'Cozy cabin living room with wooden interior',
    creator: SHIXART,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cozy_cabin_living_room_with_wooden_interior.jpg',
    ...CC_BY_2,
    width: 1920,
    height: 1282,
  },
  lakeLivingRoom: {
    src: '/images/demo/lake-living-room.jpg',
    alt: 'A bright living room with floor-to-ceiling windows looking out onto a lake',
    title: 'Cozy living room with a view of the lake and trees in the background at midday',
    creator: SHIXART,
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Cozy_living_room_with_a_view_of_the_lake_and_trees_in_the_background_at_midday.jpg',
    ...CC_BY_2,
    width: 1920,
    height: 1282,
  },
} satisfies Record<string, ImageCredit>;
