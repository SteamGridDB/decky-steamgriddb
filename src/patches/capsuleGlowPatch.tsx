import { appportraitClasses, appgridClasses } from '../static-classes';
import { addStyle } from '../utils/styleInjector';

export const addCapsuleGlowPatch = (glowAmount: number) => {
  if (!appgridClasses?.LibraryImageBackgroundGlow) return;
  addStyle('sgdb-capsule-glow', `
    .${appportraitClasses.HoversEnabled}:hover > .${appgridClasses.LibraryImageBackgroundGlow},
    .${appportraitClasses.HoversEnabled}.gpfocuswithin > .${appgridClasses.LibraryImageBackgroundGlow},

    /* old steam */
    .${appportraitClasses.HoversEnabled}:hover + .${appgridClasses.LibraryImageBackgroundGlow},
    .${appportraitClasses.HoversEnabled}.gpfocuswithin + .${appgridClasses.LibraryImageBackgroundGlow} {
      opacity: ${glowAmount/100} !important;
    }
  `);
};
