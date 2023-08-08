import {
  definePlugin,
  ServerAPI,
  quickAccessMenuClasses,
  Patch,
  findSP,
  RoutePatch,
} from 'decky-frontend-lib';

import QuickAccessSettings from './components/qam-contents/QuickAccessSettings';
import MenuIcon from './components/Icons/MenuIcon';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './components/plugin-pages/SGDBPage';
import squareLibraryPatch from './patches/squareLibraryPatch';
import contextMenuPatch, { getMenu } from './patches/contextMenuPatch';
import squareHomePatch from './patches/squareHomePatch';

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
  let squarePatchHome: RoutePatch | undefined;
  getSetting('experiment_squares', false).then((enabled) => {
    if (enabled) {
      squarePatch = squareLibraryPatch(serverApi);
      squarePatchHome = squareHomePatch(serverApi);
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
      if (squarePatchHome) {
        serverApi.routerHook.removePatch('/library/home', squarePatchHome);
      }
      findSP().window.document.getElementById('sgdb-square-capsules-library')?.remove();
      findSP().window.document.getElementById('sgdb-square-capsules-home')?.remove();
    },
  };
});
