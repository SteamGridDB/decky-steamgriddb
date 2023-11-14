import { findSP } from 'decky-frontend-lib';

import { appportraitClasses, appgridClasses } from '../static-classes';

export const addCapsuleGlowPatch = (glowAmount: number) => {
  let styleEl = findSP().window.document.getElementById('sgdb-capsule-glow');
  if (!styleEl) {
    styleEl = findSP().window.document.createElement('style');
    styleEl.id = 'sgdb-capsule-glow';
    findSP().window.document.head.append(styleEl);
  }
  styleEl.textContent = `
    .${appportraitClasses.HoversEnabled}:hover + .${appgridClasses.LibraryImageBackgroundGlow},
    .${appportraitClasses.HoversEnabled}.gpfocuswithin + .${appgridClasses.LibraryImageBackgroundGlow} {
      opacity: ${glowAmount/100} !important;
    }
  `;
};
