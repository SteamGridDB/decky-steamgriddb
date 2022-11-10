import { FC } from 'react';
import { findModuleChild } from 'decky-frontend-lib';

const className = findModuleChild((m) => m?.TabCount?.includes('TabCount') ? m.TabCount : undefined);

const TabCount: FC<{count: number}> = ({ count }) => <span className={className}>{count}</span>;

export default TabCount;