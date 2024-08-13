import { FC, CSSProperties } from 'react';
import { findModuleExport, SteamAppOverview, Export } from '@decky/ui';

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

const LibraryImage = findModuleExport((e: Export) => e?.toString && e.toString().includes('Either rgSources or app must be specified')) as FC<LibraryImageProps>;

export default LibraryImage;