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

type eAssetType = 0 | 1 | 2 | 3 | 4;

type SGDBAssetType = 'grid_p' | 'grid_l' | 'hero' | 'logo' | 'icon';