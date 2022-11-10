
import { memo, VFC } from 'react';
import { Tabs, TabsProps } from 'decky-frontend-lib';

import TabCount from './components/TabCount';
import AssetTab from './AssetTab';
import i18n from './utils/i18n';

const AssetTabs: VFC<{
  currentTab: string,
  onShowTab: TabsProps['onShowTab']
}> = ({ currentTab, onShowTab }) => {
  return <Tabs
    title="SteamGridDB"
    autoFocusContents={false}
    activeTab={currentTab}
    onShowTab={onShowTab}
    tabs={[
      {
        title: 'Capsule',
        content: <AssetTab />,
        renderTabAddon: () => <TabCount count={69} />,
        footer: {
          onOptionsActionDescription: i18n('Sort'),
          onMenuActionDescription: i18n('Filter'),
        },
        id: 'grid_p',
      },
      {
        title: 'Wide Capsule',
        content: <>grid</>,
        id: 'grid_l',
      },
      {
        title: 'Hero',
        content: <>hero</>,
        id: 'hero',
      },
      {
        title: 'Logo',
        content: <>logo</>,
        id: 'logo',
      },
    ]}
  />;
};

export default memo(AssetTabs);