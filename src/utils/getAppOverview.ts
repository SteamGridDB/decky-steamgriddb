import { SteamAppOverview } from '@decky/ui';
import waitUntil from 'async-wait-until';

const getAppOverview = async (appId: number): Promise<SteamAppOverview | null> => {
  try {
    return await waitUntil(() => {
      return window.appStore.GetAppOverviewByAppID(appId) ?? null as any;
    }, { timeout: 5000, intervalBetweenAttempts: 200 });
  } catch (err) {
    return null;
  }
};

export default getAppOverview;