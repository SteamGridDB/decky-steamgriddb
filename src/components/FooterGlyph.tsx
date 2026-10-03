import { FC, CSSProperties } from 'react';
import { findModuleExport, Export } from '@decky/ui';

export enum FooterGlyphType {
  Knockout,
  Light,
  Dark
}

export enum FooterGlyphSize {
  Small,
  Medium,
  Large
}

type FooterGlyphProps = {
  button: number;
  type?: FooterGlyphType;
  size?: FooterGlyphSize;
  style?: CSSProperties;
};

const SteamFooterGlyph = findModuleExport(
  (e: Export) =>
    e?.toString &&
    e.toString().includes('.Knockout') &&
    e.toString().includes('.additionalClassName')
) as FC<FooterGlyphProps> | undefined;

const FooterGlyph: FC<FooterGlyphProps> = (props) => {
  if (!SteamFooterGlyph) {
    return null;
  }

  return <SteamFooterGlyph {...props} />;
};

export default FooterGlyph;
