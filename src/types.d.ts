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

interface SGDBPageAppDetails extends DialogButtonProps {
  appType: bigint;
  appId: bigint
  gameId?: bigint | string;
  gameName: string;
  thirdPartyMod?: boolean;
  parentAppId?: bigint;
}
