import { findSP } from "@decky/ui";

import { appportraitClasses, gamepadLibraryClasses } from "../static-classes";
import { addStyle } from "../utils/styleInjector";

export const STYLE_GAME_LABEL = "sgdb-always-show-game-labels";
export const STYLE_GAME_LABEL_SIZE= "sgdb-always-show-game-labels-size"



export const addGameLabelsStyle = (
  _mounting = false
) => {
  // The game name label has no associated classes.
  // It has only an id like "<<rex>>" and an inline style "display: none".
  // Overwrite the inline style with !important.
  //
  // TODO: Add .${gamepadLibraryClasses.GamepadLibrary} if different style for library and recently played
  addStyle(
    STYLE_GAME_LABEL,
    `
    .${gamepadLibraryClasses.GamepadLibrary} .${appportraitClasses.LibraryItemBox} + div[id] {
      display: block !important;
      text-align: center;
      margin-top: 4px;
      margin-bottom: 4px;
      white-space: normal;
      overflow: visible;
      word-wrap: break-word;
    }
    .${appportraitClasses.LibraryItemBox}.Panel:not(:hover,:focus) + div[id] {
      display: block !important;
      text-align: center;
      margin-top: 4px;
      margin-bottom: 4px;
      white-space: normal;
      overflow: visible;
      word-wrap: break-word;
    }
  `,
  );
};

export const addGameLabelSizeStyle = (
  _mounting = false,
  squares: boolean = false,
) => {
  let font_size = '0.7em';
  if (squares)
    font_size = '0.85em';

  // TODO: Different font_sizes for library and home?
  addStyle(
    STYLE_GAME_LABEL_SIZE,
    `
    .${gamepadLibraryClasses.GamepadLibrary} .${appportraitClasses.LibraryItemBox}.Panel + div[id] {
      font-size: ${font_size};
    }
    .${appportraitClasses.InRecentGames}.${appportraitClasses.LibraryItemBox}.Panel + div[id] {
      font-size: ${font_size};
    }
    `,);
};

export const removeGameLabelsStyle = (_unmounting = false) => {
  findSP()?.window?.document?.getElementById(STYLE_GAME_LABEL)?.remove();
};

export const removeGameLabelSizeStyle = (_unmounting = false) => {
  findSP()?.window?.document?.getElementById(STYLE_GAME_LABEL_SIZE)?.remove();
};
