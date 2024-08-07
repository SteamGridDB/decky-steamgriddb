import { FC } from 'react';
import { findModuleChild } from '@decky/ui';

const className = findModuleChild((m) => m?.TabCount ? m.TabCount : undefined);

const TabCount: FC<{count: number}> = ({ count }) => <span className={className}>{count}</span>;

export default TabCount;