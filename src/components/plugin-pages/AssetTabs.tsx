
import { memo, useEffect, useState, VFC } from 'react';
import { Tabs, TabsProps } from 'decky-frontend-lib';

import t from '../../utils/i18n';
import useAssetSearch from '../../hooks/useAssetSearch';
import useSGDB from '../../hooks/useSGDB';
import { tabStrs, DEFAULT_TABS } from '../../constants';
import useSettings from '../../hooks/useSettings';

import ManageTab from './ManageTab';
import AssetTab from './AssetTab';

const AssetTabs: VFC<{
  currentTab: string,
  onShowTab: TabsProps['onShowTab']
}> = ({ currentTab, onShowTab }) => {
  const { get, set } = useSettings();
  const { appOverview } = useSGDB();
  const { openFilters } = useAssetSearch();
  const [tabPositions, setTabPositions] = useState<string[] | null>(null);
  const [hiddenTabs, setHiddenTabs] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      setTabPositions(await get('tabs_order', DEFAULT_TABS));
      setHiddenTabs(await get('tabs_hidden', []));

      // Amount of times tabs page opened, used to hide tutorial after a while
      const useCount = await get('plugin_use_count', 0);
      set('plugin_use_count', useCount + 1, true);
    })();
  }, [get, set]);

  if (!tabPositions || !hiddenTabs) return null;

  let tabs = [
    ...tabPositions
      /*
        Filter out icons if:
          - App is a mod, editing edit liblist.gam/gameinfo.txt is destructive and out of scope for this plugin
          - Shortcut is not locally installed, can't edit shortcuts.vdf remotely.
      */
      .filter((type) => !(type === 'icon' && (
        appOverview.third_party_mod ||
        (appOverview.BIsShortcut() && appOverview.selected_clientid != '0')
      )))
      // Filter hidden tabs
      .filter((x) => !hiddenTabs.includes(x)),
  ];

  /*
    If no tabs are left, force show manage tab. Useful for when only icons are selected and trying to view a mod.
  */
  if (tabs.length === 0) {
    tabs = ['manage'];
  }

  return (
    <Tabs
      title="SteamGridDB"
      autoFocusContents
      activeTab={currentTab}
      onShowTab={onShowTab}
      tabs={tabs.map((type) => {
        if (type === 'manage') {
          return {
            title: tabStrs[type],
            content: <ManageTab />,
            id: 'manage',
          };
        }
        return {
          id: type,
          title: tabStrs[type],
          content: <AssetTab assetType={type as SGDBAssetType} />,
          footer: {
            onSecondaryActionDescription: t('ACTION_OPEN_FILTER', 'Filter'),
            onSecondaryButton: () => openFilters(type as SGDBAssetType),
          },
        };
      })}
    />
  );
};

export default memo(AssetTabs);