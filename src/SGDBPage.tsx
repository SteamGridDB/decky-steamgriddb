import {
  useParams,
  Tabs,
  Tab,
  gamepadDialogClasses,
  Focusable,
  SuspensefulImage,
  SliderField,
  AppDetails
} from 'decky-frontend-lib';
import { useEffect, useState, VFC, useCallback } from 'react';
import SGDBContext from './contexts/SGDBContext';
import AssetTabs from './AssetTabs';
import style from './styles/style.css';
import getAppDetails from './utils/getAppDetails';
import log from './utils/log';

/* 
  special key only for use with this decky plugin
  attempting to use this in your own projects will
  cause you to be automatically banned and blacklisted
*/
const sgdbApiKey = '6465636b796c6f616465723432303639';

const SGDBPage: VFC = () => {
  const { appid } = useParams<{ appid: string }>();
  const [currentTab, setCurrentTab] = useState<string>('grid_p');
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doSearch = () => {
    log('do searchhh');
  };

  const onShowTab = useCallback((tabID: string) => {
    setCurrentTab(tabID);
  }, []);

  useEffect(() => {
    (async () => {
      const details = await getAppDetails(parseInt(appid));
      log('details', details);
      setAppDetails(details);
    })().catch((err) => {
      setError(err.message);
    });
  }, [appid]);

  if (!appDetails) return null;
  if (error !== null) <>{error}</>;

  return (<>
    <style>{style}</style>
    <div id="sgdb-wrap">
      <SGDBContext.Provider value={{ appDetails, doSearch }}>
        <AssetTabs currentTab={currentTab} onShowTab={onShowTab} />
      </SGDBContext.Provider>
    </div>
  </>);
};

export default SGDBPage;