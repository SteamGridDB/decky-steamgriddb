import waitUntil from 'async-wait-until';

import getAppOverview from './getAppOverview';

const getCustomLogoPosition = async (appId: number): Promise<LogoPosition | null> => {
  try {
    const appoverview = await getAppOverview(appId);
    if (!appoverview) return null;
    return await waitUntil(() => {
      try {
        return window.appDetailsStore.GetCustomLogoPosition(appoverview) as LogoPosition ?? null;
      } catch (error) {
        return null;
      }
    }, { timeout: 2000, intervalBetweenAttempts: 200 });
  } catch (err) {
    return null;
  }
};

export default getCustomLogoPosition;