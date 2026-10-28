// Decorative photos bundled in public/images/demo. They are illustrative only and are
// not photos of any listed property. They are CC0, so they need no credit and none is shown.
// Keep public/images/demo/ATTRIBUTION.md in sync.

// Licenses allowed for listing photos. Those are credited on the listing's page, which cards and
// thumbnails link to: CC 4.0 lets credit be given through a link to a page that contains it
// (section 3(a)(2)); CC0 and public domain need no credit. Older CC versions (2.0 to 3.0) have no
// such clause, so photos under them must be replaced rather than credited away from the image
export const LINKED_CREDIT_LICENSES = /^(CC BY(-SA)? 4\.0|CC0|Public domain)$/;

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

const CC0 = { license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' };

export const imageCredits = {
  cabinExterior: {
    src: '/images/demo/cabin-exterior.jpg',
    alt: 'A small log cabin with blue shutters on a lawn among autumn trees',
    title: 'Bellevue, Nebraska log cabin from SW 1',
    creator: 'Ammodramus',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bellevue,_Nebraska_log_cabin_from_SW_1.JPG',
    ...CC0,
    width: 1920,
    height: 1240,
  },
  snowyHut: {
    src: '/images/demo/snowy-hut.jpg',
    alt: 'A small wooden hut under deep snow below a forested mountainside, with clouds and sun rays',
    title: 'Greetings from the sun. - Flickr - simon berger',
    creator: 'simon from Austria',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Greetings_from_the_sun._-_Flickr_-_simon_berger.jpg',
    ...CC0,
    width: 1920,
    height: 1437,
  },
  livingRoom: {
    src: '/images/demo/living-room.jpg',
    alt: 'A bright living room with a blue sofa, house plants and a wide window',
    title: 'Living room (Unsplash)',
    creator: 'Jarosław Ceborski',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Living_room_(Unsplash).jpg',
    ...CC0,
    width: 1920,
    height: 1281,
  },
} satisfies Record<string, ImageCredit>;
