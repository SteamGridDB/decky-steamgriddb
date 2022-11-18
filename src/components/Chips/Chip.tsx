import { FC } from 'react';

const Chip: FC<{color: string}> = ({ color, children }) => (
  <li
    className="chip"
    style={{
      ['--chip-color' as string]: color
    }}
  >
    {children}
  </li>
);

export default Chip;