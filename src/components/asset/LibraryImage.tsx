import { FC, CSSProperties } from 'react';
import { findModuleExport, Export } from '@decky/ui';

export interface LibraryImageProps {
  app?: AppStoreAppOverview;
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

const findSteamLibraryImage = (): FC<LibraryImageProps> | undefined => {
  try {
    return findModuleExport((e: Export) => e?.toString && e.toString().includes('Either rgSources or app must be specified')) as FC<LibraryImageProps> | undefined;
  } catch {
    return undefined;
  }
};

const SteamLibraryImage: FC<LibraryImageProps> | undefined = findSteamLibraryImage();

if (!SteamLibraryImage) {
  console.warn('[SGDB] LibraryImage module not found; images hidden');
}

const LibraryImage: FC<LibraryImageProps> = (props) => {
  if (!SteamLibraryImage) return null;
  return <SteamLibraryImage {...props} />;
};

export default LibraryImage;
