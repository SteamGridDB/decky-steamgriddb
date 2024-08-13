import { findSP } from '@decky/ui';

import { appportraitClasses, appgridClasses } from '../static-classes';

export const addCapsuleGlowPatch = (glowAmount: number) => {
  if (!appgridClasses?.LibraryImageBackgroundGlow) return;
  let styleEl = findSP().window.document.getElementById('sgdb-capsule-glow');
  if (!styleEl) {
    styleEl = findSP().window.document.createElement('style');
    styleEl.id = 'sgdb-capsule-glow';
    findSP().window.document.head.append(styleEl);
  }
  styleEl.textContent = `
    .${appportraitClasses.HoversEnabled}:hover > .${appgridClasses.LibraryImageBackgroundGlow},
    .${appportraitClasses.HoversEnabled}.gpfocuswithin > .${appgridClasses.LibraryImageBackgroundGlow},

    /* old steam */
    .${appportraitClasses.HoversEnabled}:hover + .${appgridClasses.LibraryImageBackgroundGlow},
    .${appportraitClasses.HoversEnabled}.gpfocuswithin + .${appgridClasses.LibraryImageBackgroundGlow} {
      opacity: ${glowAmount/100} !important;
    }
  `;
};
