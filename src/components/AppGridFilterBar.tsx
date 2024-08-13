import { findModuleExport, Export } from '@decky/ui';
import { FC, HTMLAttributes } from 'react';

export const appGridFilterHeaderClass = findModuleExport((e: Export, name: any) => typeof e === 'string' && name === 'AppGridFilterHeader');

const appGridFilterTextClass = findModuleExport((e: Export, name: any) => typeof e === 'string' && name === 'AppGridFilterText');

const AppGridFilterBar: FC<HTMLAttributes<HTMLDivElement>> = ({ children, ...rest }) => (
  <div {...rest}>
    <div className={appGridFilterHeaderClass}>
      <span className={appGridFilterTextClass}>
        {children}
      </span>
    </div>
  </div>
);

export default AppGridFilterBar;