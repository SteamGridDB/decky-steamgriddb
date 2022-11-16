import { FC } from 'react';
import { findModuleChild } from 'decky-frontend-lib';

const FooterGlyph: FC<{
  button: number,
  type?: 0 | 1 | 2, // Knockout | Light | Dark
  size?: 0 | 1 | 2, // Small | Medium | Large
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