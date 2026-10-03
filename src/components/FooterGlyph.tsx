import { FC, CSSProperties } from 'react';
import { findModuleExport, Export } from '@decky/ui';

export enum FooterGlyphType { Knockout, Light, Dark }

export enum FooterGlyphSize { Small, Medium, Large }

export type FooterGlyphProps = {
  button: number,
  type?: FooterGlyphType,
  size?: FooterGlyphSize,
  style?: CSSProperties,
};

const findSteamFooterGlyph = (): FC<FooterGlyphProps> | undefined => {
  try {
    return findModuleExport((e: Export) => {
      if (typeof e !== 'function') return false;
      const source = e.toString();
      return source.includes('.additionalClassName')
        && (source.includes('.Knockout') || (source.includes('bIsKnockout') && source.includes('#ControllerButton_A')));
    }) as FC<FooterGlyphProps> | undefined;
  } catch {
    return undefined;
  }
};

const SteamFooterGlyph: FC<FooterGlyphProps> | undefined = findSteamFooterGlyph();

if (!SteamFooterGlyph) {
  console.warn('[SGDB] FooterGlyph module not found; glyphs hidden');
}

const FooterGlyph: FC<FooterGlyphProps> = (props) => {
  if (!SteamFooterGlyph) return null;
  return <SteamFooterGlyph {...props} />;
};

export default FooterGlyph;
