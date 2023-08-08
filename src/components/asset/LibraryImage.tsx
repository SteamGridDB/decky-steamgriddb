import { FC, CSSProperties } from 'react';
import { findModuleChild, SteamAppOverview } from 'decky-frontend-lib';

export interface LibraryImageProps {
  app?: SteamAppOverview;
  rgSources?: any;
  appid?: number;
  eAssetType: eAssetType;
  className?: string;
  imageClassName?: string;
  allowCustomization?: boolean;
  neverShowTitle?: boolean;
  name?: string;
  suppressTransitions?: boolean;
  bShortDisplay?: boolean;
  backgroundType?: 'transparent';
  onIncrementalError?: (evt: Event, t: any, r: any) => void;
  onLoad?: (evt: Event) => void;
  onError?: (evt: Event) => void;
  style?: CSSProperties;
}

const LibraryImage = findModuleChild((m) => {
  if (typeof m !== 'object') return;
  for (const prop in m) {
    if (m[prop]?.toString && m[prop].toString().includes('Either rgSources or app must be specified')) {
      return m[prop];
    }
  }
  return;
}) as FC<LibraryImageProps>;

export default LibraryImage;