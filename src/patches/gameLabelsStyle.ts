import { appportraitClasses, gamepadLibraryClasses } from '../static-classes';
import { addStyle, removeStyle } from '../utils/styleInjector';

const STYLE_ID = 'sgdb-always-show-game-labels';

export const addGameLabelsStyle = () => {
  addStyle(STYLE_ID, `
    .${gamepadLibraryClasses.GamepadLibrary} .${appportraitClasses.AppPortraitBanner} {
      opacity: 1 !important;
      visibility: visible !important;
      display: block !important;
    }
  `);
};

export const removeGameLabelsStyle = () => {
  removeStyle(STYLE_ID);
};
