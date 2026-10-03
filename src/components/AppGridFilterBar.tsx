import { findModuleExport, Export } from '@decky/ui';
import { FC, HTMLAttributes } from 'react';

const findClassName = (name: string): string => {
  try {
    const found = findModuleExport((e: Export, exportName: any) => typeof e === 'string' && exportName === name);
    return typeof found === 'string' ? found : '';
  } catch {
    return '';
  }
};

export const appGridFilterHeaderClass: string = findClassName('AppGridFilterHeader');

const appGridFilterTextClass: string = findClassName('AppGridFilterText');

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
