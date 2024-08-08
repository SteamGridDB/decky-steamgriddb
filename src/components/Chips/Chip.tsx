import { FC } from 'react';

const Chip: FC<{color: string, colorText?: string}> = ({ color, colorText, children }) => (
  <li
    className="chip"
    style={{
      ['--chip-color' as string]: color,
      ['--chip-text-color' as string]: colorText,
    }}
  >
    {children}
  </li>
);

export default Chip;