import { definePlugin, quickAccessMenuClasses } from '@decky/ui';
import { call, routerHook } from '@decky/api';

import QuickAccessSettings from './components/qam-contents/QuickAccessSettings';
import MenuIcon from './components/Icons/MenuIcon';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './components/plugin-pages/SGDBPage';
import contextMenuPatch, { LibraryContextMenu } from './patches/contextMenuPatch';
import { removeSquareLibraryPatch, addSquareLibraryPatch } from './patches/squareLibraryPatch';
import { removeHomePatch, addHomePatch } from './patches/homePatch';
import { addCapsuleGlowPatch } from './patches/capsuleGlowPatch';
import { removeStyles } from './utils/styleInjector';

export default definePlugin(() => {
  const getSetting = async (key: string, fallback: any): Promise<any> => {
    return await call('get_setting', key, fallback);
  };

  routerHook.addRoute('/steamgriddb/:appid/:assetType?', () => (
    <SettingsProvider>
      <SGDBProvider>
        <SGDBPage />
      </SGDBProvider>
    </SettingsProvider>
  ), {
    exact: true,
  });

  const menuPatches = contextMenuPatch(LibraryContextMenu);

  Promise.all([
    getSetting('squares', false),
    getSetting('uniform_featured', false),
  ]).then(([squares, uniformFeatured]: [boolean, boolean]) => {
    if (squares || uniformFeatured) {
      if (squares) {
        addSquareLibraryPatch(true);
      }
      addHomePatch(true, squares, uniformFeatured);
    }
  });

  getSetting('capsule_glow_amount', 100).then((amount) => {
    addCapsuleGlowPatch(parseInt(amount, 10));
  });

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <SettingsProvider><QuickAccessSettings /></SettingsProvider>,
    icon: <MenuIcon />,
    onDismount() {
      routerHook.removeRoute('/steamgriddb/:appid/:assetType?');
      menuPatches?.unpatch();

      removeSquareLibraryPatch(true);
      removeHomePatch(true);

      removeStyles(
        'sgdb-square-capsules-library',
        'sgdb-square-capsules-home',
        'sgdb-capsule-glow',
        'sgdb-carousel-logo'
      );
    },
  };
});
