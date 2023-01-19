import { findModuleChild } from 'decky-frontend-lib';
import { FC, CSSProperties } from 'react';

const Chevron: FC<{
  direction: 'up' | 'down' | 'left' | 'right',
  style?: CSSProperties,
}> = findModuleChild((m) => {
  if (typeof m !== 'object') return undefined;
  for (const prop in m) {
    if (
      !m[prop]?.toString()?.includes('36px') &&
      m[prop]?.toString()?.includes(',["direction"]') &&
      m[prop]?.toString()?.match(/case"(up|down|left|right)"/g).length === 4
    ) {
      return m[prop];
    }
  }
});

export default Chevron;
