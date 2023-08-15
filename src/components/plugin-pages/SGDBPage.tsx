import { useParams } from 'decky-frontend-lib';
import { useEffect, useState, VFC, useCallback } from 'react';

import { AssetSearchContext } from '../../hooks/useAssetSearch';
import { useSGDB } from '../../hooks/useSGDB';
import useSettings from '../../hooks/useSettings';
import { DEFAULT_TABS } from '../../constants';
import style from '../../styles/style.scss';

import AssetTabs from './AssetTabs';

const SGDBPage: VFC = () => {
  const { get } = useSettings();
  const { setAppId, appOverview } = useSGDB();
  const { appid, assetType = 'grid_p' } = useParams<{ appid: string, assetType: SGDBAssetType | 'manage' }>();
  const [currentTab, setCurrentTab] = useState<string>();

  const onShowTab = useCallback((tabID: string) => {
    setCurrentTab(tabID);
  }, []);

  useEffect(() => {
    setAppId(parseInt(appid, 10));
  }, [appid, setAppId]);

  useEffect(() => {
    (async () => {
      const positions: SGDBAssetType[] = await get('tabs_order', DEFAULT_TABS);
      const hidden: SGDBAssetType[] = await get('tabs_hidden', []);
      let tabDefault = await get('tab_default', assetType);
      const filtered = positions.filter((x) => !hidden.includes(x));

      // Set first tab as default if default is hidden
      if (!filtered.includes(tabDefault)) {
        tabDefault = filtered[0];
      }
      setCurrentTab(tabDefault);
    })();
  }, [get, assetType]);

  if (!appOverview || !currentTab) return null;

  return (
    <>
      <style>
        {style}
        {`
        #sgdb-wrap div[class*="gamepadtabbedpage_TabHeaderRowWrapper"][class*="gamepadtabbedpage_Floating"],
        #sgdb-wrap div[class*="gamepadtabbedpage_TabHeaderRowWrapper"] {
          background: #1B2838;
        }
        `}
      </style>
      <div id="sgdb-wrap">
        <AssetSearchContext>
          <AssetTabs currentTab={currentTab} onShowTab={onShowTab} />
        </AssetSearchContext>
      </div>
    </>
  );
};

export default SGDBPage;