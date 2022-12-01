import { useState, createContext, FC, useEffect, useContext, useCallback, useMemo } from 'react';
import { AppDetails, ServerAPI } from 'decky-frontend-lib';

import getAppDetails from '../utils/getAppDetails';
import log from '../utils/log';
import { ASSET_TYPE, MIMES, STYLES, DIMENSIONS } from '../constants';

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
  doSearch: (assetType: SGDBAssetType, filters?: any) => Promise<Array<any>>;
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

  const changeAsset = useCallback(async (data: string, assetType: eAssetType) => {
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
  }, [appId]);

  const getImageAsB64 = useCallback(async (url: string) : Promise<string | null> => {
    log('downloading', url);
    const download = await serverApi.callPluginMethod('download_as_base64', { url });
    if (!download.success) {
      return null;
    }
    return download.result as string;
  }, [serverApi]);

  const changeAssetFromUrl: SGDBContextType['changeAssetFromUrl'] = useCallback(async (url, assetType) => {
    const data = await getImageAsB64(url);
    if (!data) {
      throw new Error('Failed to download asset');
    }
    await changeAsset(data, ASSET_TYPE[assetType]);
  }, [changeAsset, getImageAsB64]);

  const doSearch: SGDBContextType['doSearch'] = useCallback(async (assetType, filters = null) => {
    let type = '';
    switch (assetType) {
    case 'grid_p':
    case 'grid_l':
      type = 'grids';
      break;
    case 'hero':
      type = 'heroes';
      break;
    case 'icon':
      type = 'icons';
      break;
    case 'logo':
      type = 'logos';
      break;
    }

    let adult = 'false';
    let humor = 'any';
    let epilepsy = 'any';
    let oneoftag = '';

    if (filters?.untagged === true) {
      if (filters?.humor === false) {
        humor = 'false';
      }

      if (filters?.adult === false) {
        adult = 'false';
      }

      if (filters?.epilepsy === false) {
        epilepsy = 'false';
      }
    } else {
      const selectedTags = [];
      if (filters?.humor === true) {
        humor = 'any';
        selectedTags.push('humor');
      }

      if (filters?.adult === true) {
        adult = 'any';
        selectedTags.push('nsfw');
      }

      if (filters?.epilepsy === true) {
        epilepsy = 'any';
        selectedTags.push('epilepsy');
      }

      oneoftag = selectedTags.join(',');
    }

    const qs = new URLSearchParams({
      styles:  filters?.styles ?? STYLES[assetType].default.join(','),
      dimensions: filters?.dimensions ?? DIMENSIONS[assetType].default.join(','),
      mimes: filters?.mimes ?? MIMES[assetType].default.join(','),
      nsfw: adult,
      humor,
      epilepsy,
      oneoftag,
      types: [filters?._static && 'static', filters?.animated && 'animated'].filter(Boolean).join(','),
    }).toString();

    log('do searchhh', qs);

    const res = await serverApi.fetchNoCors(`${API_BASE}/${type}/steam/${appId}?${qs}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${SGDB_API_KEY}`
      }
    });
    if (!res.success) {
      throw new Error('SGDB API request failed');
    }

    try {
      // @ts-ignore: result.body is always a string if res.success is true
      const assetRes = JSON.parse(res.result.body);
      log('search resp', assetRes);
      if (!assetRes.success) {
        throw new Error(assetRes.errors.join(', '));
      }
      return assetRes.data as Array<any>;
    } catch (err: any) {
      throw new Error(err.message);
    }
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

  const value = useMemo(() => ({
    isSearchReady: !!appId,
    serverApi,
    appDetails,
    setAppId,
    doSearch,
    restartSteam,
    changeAssetFromUrl
  }), [appDetails, appId, changeAssetFromUrl, doSearch, serverApi]);

  return <SGDBContext.Provider value={value}>
    {children}
  </SGDBContext.Provider>;
};

export const useSGDB = () => useContext(SGDBContext) as SGDBContextType;

export default useSGDB;
