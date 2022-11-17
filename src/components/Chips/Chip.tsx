import { FC } from 'react';

const Chip: FC<{color: string}> = ({ color, children }) => (
  <span
    className="chip"
    style={{
      ['--chip-color' as string]: color
    }}
  >
    {children}
  </span>
);

export default Chip;