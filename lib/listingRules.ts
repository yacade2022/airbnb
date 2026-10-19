// Shared by the add-home form (client-side hints) and utils/actions.ts (server validation)

// Keep in sync with experimental.serverActions.bodySizeLimit in next.config.ts
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
export const MAX_LOCATION_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 1000;
