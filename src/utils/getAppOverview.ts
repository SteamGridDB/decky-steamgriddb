import { SteamAppOverview } from 'decky-frontend-lib';
import waitUntil from 'async-wait-until';

const getAppOverview = async (appId: number): Promise<SteamAppOverview | null> => {
  try {
    return await waitUntil(() => {
      // @ts-ignore: appStore should exist by this point
      return window.appStore.GetAppOverviewByAppID(appId) ?? null;
    }, { timeout: 5000, intervalBetweenAttempts: 200 });
  } catch (err) {
    return null;
  }
};

export default getAppOverview;