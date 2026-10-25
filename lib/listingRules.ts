// Shared by the add-home form (client-side hints) and utils/actions.ts (server validation)

// Keep in sync with experimental.serverActions.bodySizeLimit in next.config.ts,
// which must fit the cover photo plus every gallery photo at this size
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
export const MAX_LOCATION_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 1000;
// Extra photos shown beside the description, besides the cover photo
export const MAX_GALLERY_PHOTOS = 2;
