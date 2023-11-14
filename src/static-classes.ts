import { findModule } from 'decky-frontend-lib';

export const libraryAssetImageClasses = findModule((mod) => typeof mod === 'object' && mod?.Container?.includes('libraryassetimage'));
export const gamepadLibraryClasses = findModule((mod) => typeof mod === 'object' && mod?.GamepadLibrary?.includes('gamepadlibrary'));
export const homeCarouselClasses = findModule((mod) => typeof mod === 'object' && mod?.Featured && mod?.LabelHeight);
export const appportraitClasses = findModule((mod) => typeof mod === 'object' && mod?.InRecentGames?.includes('appportrait'));
export const appgridClasses = findModule((mod) => typeof mod === 'object' && mod?.LibraryImageBackgroundGlow?.includes('appgrid'));