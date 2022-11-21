import { FC } from 'react';
import { findModuleChild } from 'decky-frontend-lib';

export enum FooterGlyphType { Knockout, Light, Dark }

export enum FooterGlyphSize { Small, Medium, Large }

const FooterGlyph: FC<{
  button: number,
  type?: FooterGlyphType,
  size?: FooterGlyphSize,
}> = findModuleChild((m) => {
  if (typeof m !== 'object') return;
  for (const prop in m) {
    if (m[prop]?.toString && m[prop].toString().includes('RearLeftLower')) {
      return m[prop];
    }
  }
  return;
});

export default FooterGlyph;