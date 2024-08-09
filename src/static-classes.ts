import { findModule } from '@decky/ui';

export const libraryAssetImageClasses = findModule((mod) => typeof mod === 'object' && mod?.PortraitImage && mod?.Container && mod?.LandscapeImage);
export const gamepadLibraryClasses = findModule((mod) => typeof mod === 'object' && mod?.GamepadLibrary);
export const homeCarouselClasses = findModule((mod) => typeof mod === 'object' && mod?.Featured && mod?.LabelHeight);
export const appportraitClasses = findModule((mod) => typeof mod === 'object' && mod?.AppPortraitBanner);
export const appgridClasses = findModule((mod) => typeof mod === 'object' && mod?.LibraryImageBackgroundGlow);