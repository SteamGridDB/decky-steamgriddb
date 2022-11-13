import { useState, createContext, FC, useEffect, useContext } from 'react';
import { AppDetails, ServerAPI } from 'decky-frontend-lib';

import getAppDetails from '../utils/getAppDetails';
import log from '../utils/log';
import i18n from '../utils/i18n';

/* 
  special key only for use with this decky plugin
  attempting to use this in your own projects will
  cause you to be automatically banned and blacklisted
*/
const SGDB_API_KEY = '6465636b796c6f616465723432303639';

const API_BASE = process.env.ROLLUP_ENV === 'development' ? 'http://sgdb.test/api/v2' : 'https://www.steamgriddb.com/api/v2';

export type SGDBContextType = {
  isSearchReady: boolean;
  setAppId: React.Dispatch<React.SetStateAction<number | null>>;
  appDetails: AppDetails | null;
  doSearch: () => Promise<Array<any>>;
  restartSteam: () => void;
  serverApi: ServerAPI;
  changeAssetFromUrl: (url: string, assetType: eAssetType) => Promise<void>;
}

export const SGDBContext = createContext({});

export const SGDBProvider: FC<{ serverApi: ServerAPI }> = ({ serverApi, children }) => {
  const [appId, setAppId] = useState<number | null>(null);
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [assetList, setAssetList] = useState([]);

  const restartSteam = () => {
    SteamClient.User.StartRestart();
  };

  const changeAsset = async (data: string, assetType: eAssetType) => {
    try {
      await SteamClient.Apps.ClearCustomArtworkForApp(appId, assetType);
      await SteamClient.Apps.SetCustomArtworkForApp(appId, data, 'png', assetType);
    } catch (error) {
      log(i18n('#CustomArt_UnknownError'));
    }
  };

  const getUrlAsB64 = async (url: string) : Promise<string | null> => {
    /*
      Would use fetchNoCors() here but it doesn't return binary data due to parsing response as text
      https://github.com/SteamDeckHomebrew/decky-loader/blob/b44896524f44fd862f9a385147cd755104a09cdc/backend/utilities.py#L87
    */
    log('downloading', url);
    const download = await serverApi.callPluginMethod('download_as_base64', { url });
    if (!download.success) {
      return null;
    }
    return download.result as string;
  };

  const changeAssetFromUrl = async (url: string, assetType: eAssetType) => {
    const data = await getUrlAsB64(url);
    if (!data) {
      throw new Error('Failed to download asset');
    }
    await changeAsset(data, assetType);
  };

  const doSearch = async () => {
    log('do searchhh');
    const res = await serverApi.fetchNoCors(`${API_BASE}/grids/steam/${appId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${SGDB_API_KEY}`,
        'User-Agent': 'Decky/1.0'
      }
    });
    if (!res.success) {
      throw new Error('SGDB API request failed');
    }

    // @ts-ignore: result.body is always a string if res.success is true
    const assetRes = JSON.parse(res.result.body);
    log('search resp', assetRes);
    return assetRes.data as Array<any>;
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
      isSearchReady: !!appId,
      serverApi,
      appDetails,
      setAppId,
      doSearch,
      restartSteam,
      assetList,
      changeAssetFromUrl
    }}
  >
    {children}
  </SGDBContext.Provider>;
};

export const useSGDB = () => useContext(SGDBContext) as SGDBContextType;

export default useSGDB;
