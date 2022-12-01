
import { memo, VFC } from 'react';
import { Tabs, TabsProps } from 'decky-frontend-lib';

import AssetTab from './AssetTab';
import LocalTab from './LocalTab';
import t from './utils/i18n';
import useAssetSearch from './hooks/useAssetSearch';

const AssetTabs: VFC<{
  currentTab: string,
  onShowTab: TabsProps['onShowTab']
}> = ({ currentTab, onShowTab }) => {
  const { openFilters } = useAssetSearch();

  return <Tabs
    title="SteamGridDB"
    autoFocusContents
    activeTab={currentTab}
    onShowTab={onShowTab}
    tabs={[
      {
        title: t('Capsule'),
        content: <AssetTab assetType="grid_p" />,
        id: 'grid_p',
        footer: {
          onSecondaryActionDescription: t('Filter'),
          onSecondaryButton: () => openFilters('grid_p')
        }
      },
      {
        title: t('Wide Capsule'),
        content: <AssetTab assetType="grid_l" />,
        id: 'grid_l',
        footer: {
          onSecondaryActionDescription: t('Filter'),
          onSecondaryButton: () => openFilters('grid_l')
        }
      },
      {
        title: t('Hero'),
        content: <AssetTab assetType="hero" />,
        id: 'hero',
        footer: {
          onSecondaryActionDescription: t('Filter'),
          onSecondaryButton: () => openFilters('hero')
        }
      },
      {
        title: t('Logo'),
        content: <AssetTab assetType="logo" />,
        id: 'logo',
        footer: {
          onSecondaryActionDescription: t('Filter'),
          onSecondaryButton: () => openFilters('logo')
        }
      },
      {
        title: t('Icon'),
        content: <AssetTab assetType="icon" />,
        id: 'icon',
        footer: {
          onSecondaryActionDescription: t('Filter'),
          onSecondaryButton: () => openFilters('icon')
        }
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