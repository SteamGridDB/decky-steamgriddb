import { findModuleChild } from 'decky-frontend-lib';
import { FC, HTMLAttributes } from 'react';

const appGridFilterHeaderClass = findModuleChild((m) => {
  if (typeof m !== 'object') return;
  for (const prop in m) {
    if (typeof m[prop] === 'string' && prop === 'AppGridFilterHeader') {
      return m[prop];
    }
  }
  return;
});

const appGridFilterTextClass = findModuleChild((m) => {
  if (typeof m !== 'object') return;
  for (const prop in m) {
    if (typeof m[prop] === 'string' && prop === 'AppGridFilterText') {
      return m[prop];
    }
  }
  return;
});

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