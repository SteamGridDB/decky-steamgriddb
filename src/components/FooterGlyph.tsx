import { FC, CSSProperties } from 'react';
import { findModuleExport, Export } from '@decky/ui';

export enum FooterGlyphType { Knockout, Light, Dark }

export enum FooterGlyphSize { Small, Medium, Large }

const FooterGlyph: FC<{
  button: number,
  type?: FooterGlyphType,
  size?: FooterGlyphSize,
  style?: CSSProperties,
}> = findModuleExport((e: Export) => e?.toString && e.toString().includes('.Knockout') && e.toString().includes('.additionalClassName'));

export default FooterGlyph;