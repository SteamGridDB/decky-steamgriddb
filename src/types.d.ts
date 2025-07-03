declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.webm' {
  const content: string;
  export default content;
}

type eAssetType = 0 | 1 | 2 | 3 | 4;

type SGDBAssetType = 'grid_p' | 'grid_l' | 'hero' | 'logo' | 'icon';

type LogoPinPositions = 'BottomLeft' | 'UpperLeft' | 'CenterCenter' | 'UpperCenter' | 'BottomCenter';

interface LogoPosition {
  pinnedPosition: LogoPinPositions;
  nWidthPct: number;
  nHeightPct: number;
}

type SteamAppOverview = import('@decky/ui/dist/globals/steam-client/App').SteamAppOverview;

interface AppStoreAppOverview extends SteamAppOverview {
  m_setStoreCategories: Set<number>;
  m_setStoreTags: Set<number>;
  m_strPerClientData: Set<any> | undefined;
  m_strAssociations: Set<any> | undefined;
  BIsModOrShortcut: () => boolean;
  BIsShortcut: () => boolean;
}