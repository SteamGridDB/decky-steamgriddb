import {
  useParams,
  Tabs,
  Tab,
  AppDetails,
  ServerAPI
} from 'decky-frontend-lib';
import { useEffect, useState, VFC, useCallback } from 'react';
import AssetTabs from './AssetTabs';
import { useSGDB } from './SGDBProvider';
import style from './styles/style.scss';

const SGDBPage: VFC = () => {
  const { setAppId, appDetails, doSearch } = useSGDB();
  const { appid } = useParams<{ appid: string }>();
  const [currentTab, setCurrentTab] = useState<string>('grid_p');

  const onShowTab = useCallback((tabID: string) => {
    setCurrentTab(tabID);
  }, []);

  useEffect(() => {
    setAppId(parseInt(appid, 10));
  }, [appid]);

  if (!appDetails) return null;

  return (<>
    <style>{style}</style>
    <div id="sgdb-wrap">
      <AssetTabs currentTab={currentTab} onShowTab={onShowTab} />
    </div>
  </>);
};

export default SGDBPage;