import { useState, createContext, FC, useEffect, useContext } from 'react';
import { AppDetails, ServerAPI } from 'decky-frontend-lib';

import getAppDetails from './utils/getAppDetails';
import log from './utils/log';

/* 
  special key only for use with this decky plugin
  attempting to use this in your own projects will
  cause you to be automatically banned and blacklisted
*/
const SGDB_API_KEY = '6465636b796c6f616465723432303639';

export interface SGDBContextType {
  setAppId: React.Dispatch<React.SetStateAction<number | null>>;
  appDetails: AppDetails | null;
  doSearch: (query: string) => void;
  restartSteam: () => void;
  serverApi: ServerAPI;
}

export const SGDBContext = createContext({});

export const SGDBProvider: FC<{ serverApi: ServerAPI }> = ({ serverApi, children }) => {
  const [appId, setAppId] = useState<number | null>(null);
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [assetList, setAssetList] = useState([]);

  const restartSteam = () => {
    SteamClient.User.StartRestart();
  };

  const doSearch = () => {
    log('do searchhh');
    log(SGDB_API_KEY, serverApi.fetchNoCors);
    // setAssetList
  };

  useEffect(() => {
    if (appId) {
      (async () => {
        const details = await getAppDetails(appId);
        log('details', details);
        setAppDetails(details);
      })().catch((err) => {
        //
      });
    }
  }, [appId]);

  return <SGDBContext.Provider
    value={{
      serverApi,
      appDetails,
      setAppId,
      doSearch,
      restartSteam,
      assetList
    } as SGDBContextType}
  >
    {children}
  </SGDBContext.Provider>;
};

export const useSGDB = () => useContext(SGDBContext) as SGDBContextType;
