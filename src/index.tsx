import { definePlugin, quickAccessMenuClasses } from '@decky/ui';
import { call, routerHook } from '@decky/api';

import QuickAccessSettings from './components/qam-contents/QuickAccessSettings';
import MenuIcon from './components/Icons/MenuIcon';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './components/plugin-pages/SGDBPage';
import contextMenuPatch, { getLibraryContextMenu } from './patches/contextMenuPatch';
import { removeSquareLibraryPatch, addSquareLibraryPatch } from './patches/squareLibraryPatch';
import { removeHomePatch, addHomePatch } from './patches/homePatch';
import { addCapsuleGlowPatch } from './patches/capsuleGlowPatch';
import { removeStyles } from './utils/styleInjector';
import { setDebugLogging } from './utils/log';

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

  getSetting('debug_logging', false).then((enabled) => {
    setDebugLogging(!!enabled);
  }).catch(() => undefined);

  // Each patch is fail-soft: a Steam module that can't be found only disables that feature.
  let menuPatches: ReturnType<typeof contextMenuPatch> | undefined;
  try {
    menuPatches = contextMenuPatch(getLibraryContextMenu());
  } catch (error) {
    console.warn('[SGDB] Failed to apply context menu patch', error);
  }

  Promise.all([
    getSetting('squares', false),
    getSetting('uniform_featured', false),
  ]).then(([squares, uniformFeatured]: [boolean, boolean]) => {
    if (squares || uniformFeatured) {
      if (squares) {
        try {
          addSquareLibraryPatch(true);
        } catch (error) {
          console.warn('[SGDB] Failed to apply square library patch', error);
        }
      }
      try {
        addHomePatch(true, squares, uniformFeatured);
      } catch (error) {
        console.warn('[SGDB] Failed to apply home patch', error);
      }
    }
  }).catch((error) => {
    console.warn('[SGDB] Failed to load square/featured settings', error);
  });

  getSetting('capsule_glow_amount', 100).then((amount) => {
    try {
      addCapsuleGlowPatch(parseInt(amount, 10));
    } catch (error) {
      console.warn('[SGDB] Failed to apply capsule glow patch', error);
    }
  }).catch((error) => {
    console.warn('[SGDB] Failed to load capsule glow setting', error);
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
