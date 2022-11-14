
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
        content: <AssetTab assetType="grid_p" />,
        renderTabAddon: () => <TabCount count={69} />,
        id: 'grid_p',
      },
      {
        title: 'Wide Capsule',
        content: <AssetTab assetType="grid_l" />,
        id: 'grid_l',
      },
      {
        title: 'Hero',
        content: <AssetTab assetType="hero" />,
        id: 'hero',
      },
      {
        title: 'Logo',
        content: <AssetTab assetType="logo" />,
        id: 'logo',
      },
      {
        title: 'Icon',
        content: <AssetTab assetType="icon" />,
        id: 'icon',
      },
      {
        title: 'Local Files',
        content: <>change assets via file picker</>,
        id: 'local',
      },
    ]}
  />;
};

export default memo(AssetTabs);