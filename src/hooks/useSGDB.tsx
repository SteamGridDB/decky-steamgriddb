import { useState, createContext, FC, useEffect, useContext, useCallback } from 'react';
import { AppDetails, ServerAPI } from 'decky-frontend-lib';

import getAppDetails from '../utils/getAppDetails';
import log from '../utils/log';
import { ASSET_TYPE } from '../constants';

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
  doSearch: (assetType: SGDBAssetType) => Promise<Array<any>>;
  restartSteam: () => void;
  serverApi: ServerAPI;
  changeAssetFromUrl: (url: string, assetType: SGDBAssetType) => Promise<void>;
}

export const SGDBContext = createContext({});

export const SGDBProvider: FC<{ serverApi: ServerAPI }> = ({ serverApi, children }) => {
  const [appId, setAppId] = useState<number | null>(null);
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);

  const restartSteam = () => {
    SteamClient.User.StartRestart();
  };

  const changeAsset = async (data: string, assetType: eAssetType) => {
    try {
      await SteamClient.Apps.ClearCustomArtworkForApp(appId, assetType);
      await SteamClient.Apps.SetCustomArtworkForApp(appId, data, 'png', assetType);
      if (assetType === ASSET_TYPE.logo) {
        // avoid huge logos on Steam games by providing decent defaults
        const bottomLeftPos = {
          nVersion: 1,
          logoPosition: {
            pinnedPosition: 'BottomLeft',
            nWidthPct: 42,
            nHeightPct: 65
          }
        };
        await SteamClient.Apps.SetCustomLogoPositionForApp(appId, JSON.stringify(bottomLeftPos));
      }
    } catch (error) {
      log(error);
    }
  };

  const getImageAsB64 = async (url: string) : Promise<string | null> => {
    log('downloading', url);
    const download = await serverApi.callPluginMethod('download_as_base64', { url });
    if (!download.success) {
      return null;
    }
    return download.result as string;
  };

  const changeAssetFromUrl: SGDBContextType['changeAssetFromUrl'] = async (url, assetType) => {
    const data = await getImageAsB64(url);
    if (!data) {
      throw new Error('Failed to download asset');
    }
    await changeAsset(data, ASSET_TYPE[assetType]);
  };

  const doSearch: SGDBContextType['doSearch'] = useCallback(async (assetType) => {
    log('do searchhh');
    let type = 'grids';
    let dimensions = '600x900,342x482,660x930';
    switch (assetType) {
    case 'grid_l':
      dimensions = '460x215,920x430';
      break;
    case 'hero':
      type = 'heroes';
      dimensions = '1920x620,3840x1240,1600x650';
      break;
    case 'icon':
      type = 'icons';
      dimensions = '';
      break;
    case 'logo':
      type = 'logos';
      dimensions = '';
      break;
    }
    const qs = new URLSearchParams({
      dimensions,
      types: 'static,animated'
    }).toString();
    const res = await serverApi.fetchNoCors(`${API_BASE}/${type}/steam/${appId}?${qs}`, {
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
  }, [appId, serverApi]);

  useEffect(() => {
    if (appId) {
      (async () => {
        const details = await getAppDetails(appId);
        log('details', details);
        setAppDetails(details);
      })().catch(() => {
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
      changeAssetFromUrl
    }}
  >
    {children}
  </SGDBContext.Provider>;
};

export const useSGDB = () => useContext(SGDBContext) as SGDBContextType;

export default useSGDB;
