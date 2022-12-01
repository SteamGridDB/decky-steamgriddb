import { useParams } from 'decky-frontend-lib';
import { useEffect, useState, VFC, useCallback } from 'react';
import AssetTabs from './AssetTabs';
import { AssetSearchContext } from './hooks/useAssetSearch';
import { useSGDB } from './hooks/useSGDB';
import style from './styles/style.scss';

const SGDBPage: VFC = () => {
  const { setAppId, appDetails } = useSGDB();
  const { appid, assetType = 'grid_p' } = useParams<{ appid: string, assetType: SGDBAssetType }>();
  const [currentTab, setCurrentTab] = useState<string>(assetType);

  const onShowTab = useCallback((tabID: string) => {
    setCurrentTab(tabID);
  }, []);

  useEffect(() => {
    setAppId(parseInt(appid, 10));
  }, [appid, setAppId]);

  if (!appDetails) return null;

  return (<>
    <style>{style}</style>
    <div id="sgdb-wrap">
      <AssetSearchContext>
        <AssetTabs currentTab={currentTab} onShowTab={onShowTab} />
      </AssetSearchContext>
    </div>
  </>);
};

export default SGDBPage;