
import { memo, VFC } from 'react';
import { Tabs, TabsProps } from 'decky-frontend-lib';

import AssetTab from './AssetTab';
import ManageTab from './ManageTab';
import t from './utils/i18n';
import useAssetSearch from './hooks/useAssetSearch';
import useSGDB from './hooks/useSGDB';

// Sometimes tabs needs different translation strings
const tabStrs: Record<SGDBAssetType, string> = {
  grid_p: t('LABEL_TAB_CAPSULE', 'Capsule'),
  grid_l: t('LABEL_TAB_WIDECAPSULE', 'Wide Capsule'),
  hero: t('LABEL_TAB_HERO', 'Hero'),
  logo: t('LABEL_TAB_LOGO', 'Logo'),
  icon: t('LABEL_TAB_ICON', 'Icon'),
};

const AssetTabs: VFC<{
  currentTab: string,
  onShowTab: TabsProps['onShowTab']
}> = ({ currentTab, onShowTab }) => {
  const { appOverview } = useSGDB();
  const { openFilters } = useAssetSearch();

  return (
    <Tabs
      title="SteamGridDB"
      autoFocusContents
      activeTab={currentTab}
      onShowTab={onShowTab}
      tabs={[
        ...Object.keys(tabStrs)
          // Icons won't work on mods unless you edit liblist.gam/gameinfo.txt and no way that's happening in this plugin
          .filter((type) => !(appOverview.third_party_mod && type === 'icon'))
          .map((type) => ({
            id: type,
            title: tabStrs[type],
            content: <AssetTab assetType={type as SGDBAssetType} />,
            footer: {
              onSecondaryActionDescription: t('ACTION_OPEN_FILTER', 'Filter'),
              onSecondaryButton: () => openFilters(type as SGDBAssetType),
            },
          })),
        {
          title: t('LABEL_TAB_MANAGE', 'Manage'),
          content: <ManageTab />,
          id: 'manage',
        },
      ]}
    />
  );
};

export default memo(AssetTabs);