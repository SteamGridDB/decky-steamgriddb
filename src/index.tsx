import {
  definePlugin,
  ServerAPI,
  quickAccessMenuClasses,
  Patch,
  findSP,
  RoutePatch,
} from 'decky-frontend-lib';

import QuickAccessSettings from './QuickAccessSettings';
import MenuIcon from './components/Icons/MenuIcon';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './SGDBPage';
import squareCapsulesPatch from './squareCapsulesPatch';
import contextMenuPatch, { getMenu } from './contextMenuPatch';

export default definePlugin((serverApi: ServerAPI) => {
  const getSetting = async (key: string, fallback: any) => {
    return (await serverApi.callPluginMethod('get_setting', { key, default: fallback })).result;
  };

  serverApi.routerHook.addRoute('/steamgriddb/:appid/:assetType?', () => (
    <SettingsProvider serverApi={serverApi}>
      <SGDBProvider serverApi={serverApi}>
        <SGDBPage />
      </SGDBProvider>
    </SettingsProvider>
  ), {
    exact: true,
  });

  let patchedMenu: Patch | undefined;
  getMenu().then((LibraryContextMenu) => {
    patchedMenu = contextMenuPatch(LibraryContextMenu);
  });

  let squarePatch: RoutePatch | undefined;
  getSetting('experiment_squares', false).then((enabled) => {
    if (enabled) {
      squarePatch = squareCapsulesPatch(serverApi);
    }
  });

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <SettingsProvider serverApi={serverApi}><QuickAccessSettings serverApi={serverApi} /></SettingsProvider>,
    icon: <MenuIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute('/steamgriddb/:appid/:assetType?');
      patchedMenu?.unpatch();
      if (squarePatch) {
        serverApi.routerHook.removePatch('/library', squarePatch);
      }
      findSP().window.document.getElementById('sgdb-square-capsules')?.remove();
    },
  };
});
