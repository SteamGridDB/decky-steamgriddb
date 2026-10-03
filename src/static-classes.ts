import { findModule, findClassModule } from '@decky/ui';

/**
 * Runs a Steam module lookup defensively.
 * On newer Steam clients a lookup may return undefined or throw; in that case only
 * the feature depending on the module is disabled instead of the whole plugin failing to load.
 */
const safeFind = <T>(name: string, lookup: () => T): T | undefined => {
  try {
    const result = lookup();
    if (!result) {
      console.warn(`[SGDB] ${name} not found; dependent features disabled`);
      return undefined;
    }
    return result;
  } catch (error) {
    console.warn(`[SGDB] ${name} lookup failed; dependent features disabled`, error);
    return undefined;
  }
};

export const libraryAssetImageClasses: any | undefined = safeFind('libraryAssetImageClasses', () =>
  findModule((mod) => typeof mod === 'object' && mod?.PortraitImage && mod?.Container && mod?.LandscapeImage)
);
export const gamepadLibraryClasses: any | undefined = safeFind('gamepadLibraryClasses', () =>
  findModule((mod) => typeof mod === 'object' && mod?.GamepadLibrary)
);
export const homeCarouselClasses: any | undefined = safeFind('homeCarouselClasses', () =>
  findModule((mod) => typeof mod === 'object' && mod?.Featured && mod?.LabelHeight && mod?.CarouselGameLabelWrapper)
);
export const appportraitClasses: any | undefined = safeFind('appportraitClasses', () =>
  findModule((mod) => typeof mod === 'object' && mod?.AppPortraitBanner)
);
export const appgridClasses: any | undefined = safeFind('appgridClasses', () =>
  findModule((mod) => typeof mod === 'object' && mod?.LibraryImageBackgroundGlow)
);
// seems to have Marquee, info box, and subheader stuff
export const miscInfoClasses: any | undefined = safeFind('miscInfoClasses', () =>
  findClassModule((m) => m.ResetOnPause && m.Content && m.Playing && m.BackgroundAnimation && m.Container) as any
);
