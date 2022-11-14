
import { memo, VFC } from 'react';
import { Tabs, TabsProps } from 'decky-frontend-lib';

import AssetTab from './AssetTab';
import t from './utils/i18n';
import LocalTab from './LocalTab';

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
        title: t('Capsule'),
        content: <AssetTab assetType="grid_p" />,
        id: 'grid_p',
      },
      {
        title: t('Wide Capsule'),
        content: <AssetTab assetType="grid_l" />,
        id: 'grid_l',
      },
      {
        title: t('Hero'),
        content: <AssetTab assetType="hero" />,
        id: 'hero',
      },
      {
        title: t('Logo'),
        content: <AssetTab assetType="logo" />,
        id: 'logo',
      },
      {
        title: t('Icon'),
        content: <AssetTab assetType="icon" />,
        id: 'icon',
      },
      {
        title: t('Local Files'),
        content: <LocalTab />,
        id: 'local',
      },
    ]}
  />;
};

export default memo(AssetTabs);