import { FC, CSSProperties } from 'react';
import { findModuleExport, Export } from '@decky/ui';

export enum FooterGlyphType { Knockout, Light, Dark }

export enum FooterGlyphSize { Small, Medium, Large }

const FooterGlyph: FC<{
  button: number,
  type?: FooterGlyphType,
  size?: FooterGlyphSize,
  style?: CSSProperties,
}> = findModuleExport((e: Export) => {
  if (typeof e !== 'function') return false;
  const source = e.toString();
  return source.includes('.additionalClassName') && (
    source.includes('.Knockout') ||
    (source.includes('bIsKnockout') && source.includes('#ControllerButton_A'))
  );
});

export default FooterGlyph;
