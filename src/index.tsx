import {
  definePlugin,
  ServerAPI,
  quickAccessMenuClasses,
  findSP,
} from 'decky-frontend-lib';

import QuickAccessSettings from './components/qam-contents/QuickAccessSettings';
import MenuIcon from './components/Icons/MenuIcon';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './components/plugin-pages/SGDBPage';
import contextMenuPatch, { LibraryContextMenu } from './patches/contextMenuPatch';
import { removeSquareLibraryPatch, addSquareLibraryPatch } from './patches/squareLibraryPatch';
import { removeSquareHomePatch, addSquareHomePatch } from './patches/squareHomePatch';
import { addCapsuleGlowPatch } from './patches/capsuleGlowPatch';

export default definePlugin((serverApi: ServerAPI) => {
  const getSetting = async (key: string, fallback: any): Promise<any> => {
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

  const menuPatches = contextMenuPatch(LibraryContextMenu);

  getSetting('squares', false).then((enabled) => {
    if (enabled) {
      addSquareLibraryPatch(serverApi, true);
      addSquareHomePatch(serverApi, true);
    }
  });

  getSetting('capsule_glow_amount', 100).then((amount) => {
    addCapsuleGlowPatch(parseInt(amount, 10));
  });

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <SettingsProvider serverApi={serverApi}><QuickAccessSettings serverApi={serverApi} /></SettingsProvider>,
    icon: <MenuIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute('/steamgriddb/:appid/:assetType?');
      menuPatches?.unpatch();

      removeSquareLibraryPatch(serverApi, true);
      removeSquareHomePatch(serverApi, true);

      findSP().window.document.getElementById('sgdb-square-capsules-library')?.remove();
      findSP().window.document.getElementById('sgdb-square-capsules-home')?.remove();
      findSP().window.document.getElementById('sgdb-capsule-glow')?.remove();
    },
  };
});
