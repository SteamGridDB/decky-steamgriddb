import { FC, CSSProperties } from 'react';
import { findModuleChild } from 'decky-frontend-lib';

export interface MarqueeProps {
  play?: boolean;
  direction?: 'left' | 'right';
  speed?: number;
  delay?: number;
  fadeLength?: number;
  center?: boolean;
  resetOnPause?: boolean;
  style?: CSSProperties;
  className?: string;
  children: React.ReactNode;
}

const Marquee: FC<MarqueeProps> = findModuleChild((m) => {
  if (typeof m !== 'object') return;
  for (const prop in m) {
    if (m[prop]?.toString && m[prop].toString().includes('.Marquee') && m[prop].toString().includes('--fade-length')) {
      return m[prop];
    }
  }
  return;
});

export default Marquee;
