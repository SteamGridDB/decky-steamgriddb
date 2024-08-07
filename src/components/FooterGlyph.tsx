import { FC, CSSProperties } from 'react';
import { findModuleChild } from '@decky/ui';

export enum FooterGlyphType { Knockout, Light, Dark }

export enum FooterGlyphSize { Small, Medium, Large }

const FooterGlyph: FC<{
  button: number,
  type?: FooterGlyphType,
  size?: FooterGlyphSize,
  style?: CSSProperties,
}> = findModuleChild((m) => {
  if (typeof m !== 'object') return;
  for (const prop in m) {
    if (m[prop]?.toString && m[prop].toString().includes('.Knockout') && m[prop].toString().includes('.additionalClassName')) {
      return m[prop];
    }
  }
  return;
});

export default FooterGlyph;