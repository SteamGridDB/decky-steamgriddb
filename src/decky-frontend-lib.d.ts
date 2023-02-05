import {
  SteamAppOverview as SteamAppOverviewO,
  SliderFieldProps as SliderFieldPropsO,
  ToggleFieldProps as ToggleFieldPropsO,
  AppDetails as AppDetailsO,
} from 'decky-frontend-lib';

declare module 'decky-frontend-lib' {
  export interface SteamAppOverview extends SteamAppOverviewO {
    appid: number,
    display_name: string,
    icon_hash: string,
    third_party_mod?: boolean,
    selected_clientid?: string,
    BIsModOrShortcut: () => boolean,
    BIsShortcut: () => boolean,
  }
  export interface SliderFieldProps extends SliderFieldPropsO {
    className?: string;
  }
  export interface ToggleFieldProps extends ToggleFieldPropsO {
    highlightOnFocus?: boolean;
  }
  export interface AppDetails extends AppDetailsO {
    libraryAssets?: {
      logoPosition?: LogoPosition
    };
  }
}