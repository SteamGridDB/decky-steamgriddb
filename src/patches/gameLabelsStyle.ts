import { findSP } from "@decky/ui";

import { appportraitClasses } from "../static-classes";
import { addStyle } from "../utils/styleInjector";

const STYLE_ID = "sgdb-always-show-game-labels";

export const addGameLabelsStyle = (_mounting = false) => {
  addStyle(
    STYLE_ID,
    `
    .${appportraitClasses.LibraryItemBox} + div[id] {
      display: block !important;
      text-align: center;
      margin-top: 4px;
      font-size: 0.7em;
      white-space: normal;
      overflow: visible;
      word-wrap: break-word;
    }
  `,
  );
};

export const removeGameLabelsStyle = (_unmounting = false) => {
  findSP()?.window?.document?.getElementById(STYLE_ID)?.remove();
};
