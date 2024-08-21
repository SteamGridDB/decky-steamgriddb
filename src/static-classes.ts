import { findModule, findClassModule } from 'decky-frontend-lib';

export const libraryAssetImageClasses = findModule((mod) => typeof mod === 'object' && mod?.PortraitImage && mod?.Container && mod?.LandscapeImage);
export const gamepadLibraryClasses = findModule((mod) => typeof mod === 'object' && mod?.GamepadLibrary);
export const homeCarouselClasses = findModule((mod) => typeof mod === 'object' && mod?.Featured && mod?.LabelHeight && mod?.CarouselGameLabelWrapper);
export const appportraitClasses = findModule((mod) => typeof mod === 'object' && mod?.AppPortraitBanner);
export const appgridClasses = findModule((mod) => typeof mod === 'object' && mod?.LibraryImageBackgroundGlow);
// seems to have Marquee, info box, and subheader stuff
export const miscInfoClasses = findClassModule((m) => m.ResetOnPause && m.Content && m.Playing && m.BackgroundAnimation && m.Container) as any;