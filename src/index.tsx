import {
  definePlugin,
  ServerAPI,
  quickAccessMenuClasses,
  Patch,
  findSP,
} from 'decky-frontend-lib';

import QuickAccessSettings from './components/qam-contents/QuickAccessSettings';
import MenuIcon from './components/Icons/MenuIcon';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './components/plugin-pages/SGDBPage';
import contextMenuPatch, { getMenu } from './patches/contextMenuPatch';
import { removeSquareLibraryPatch, addSquareLibraryPatch } from './patches/squareLibraryPatch';
import { removeSquareHomePatch, addSquareHomePatch } from './patches/squareHomePatch';

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

  getSetting('squares', false).then((enabled) => {
    console.log('enabled on load:', enabled);
    if (enabled) {
      addSquareLibraryPatch(serverApi, true);
      addSquareHomePatch(serverApi, true);
    }
  });

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <SettingsProvider serverApi={serverApi}><QuickAccessSettings serverApi={serverApi} /></SettingsProvider>,
    icon: <MenuIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute('/steamgriddb/:appid/:assetType?');
      patchedMenu?.unpatch();

      removeSquareLibraryPatch(serverApi, true);
      removeSquareHomePatch(serverApi, true);

      findSP().window.document.getElementById('sgdb-square-capsules-library')?.remove();
      findSP().window.document.getElementById('sgdb-square-capsules-home')?.remove();
    },
  };
});
