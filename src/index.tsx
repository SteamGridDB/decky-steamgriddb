import { definePlugin, Navigation, quickAccessMenuClasses } from '@decky/ui';
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
import t from './utils/i18n';

export default definePlugin(() => {
  const contextMenuInstanceToken = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let isContextMenuInstanceSelected = false;
  const contextMenuChannel = typeof BroadcastChannel === 'function'
    ? new BroadcastChannel('steamgriddb-context-menu')
    : null;
  const onContextMenuMessage = (event: MessageEvent) => {
    const message = event.data;
    if (message?.type === 'request-register') {
      contextMenuChannel?.postMessage({ type: 'register', token: contextMenuInstanceToken });
    } else if (message?.type === 'registered') {
      isContextMenuInstanceSelected = message.token === contextMenuInstanceToken;
      if (isContextMenuInstanceSelected) {
        contextMenuChannel?.postMessage({
          type: 'label',
          token: contextMenuInstanceToken,
          label: t('ACTION_CHANGE_ARTWORK', 'Change Artwork...'),
        });
      }
    } else if (
      message?.type === 'navigate' &&
      isContextMenuInstanceSelected &&
      message.token === contextMenuInstanceToken &&
      typeof message.appId === 'number' &&
      Number.isSafeInteger(message.appId) &&
      message.appId > 0
    ) {
      Navigation.Navigate(`/steamgriddb/${message.appId}`);
    }
  };
  contextMenuChannel?.addEventListener('message', onContextMenuMessage);
  contextMenuChannel?.postMessage({ type: 'register', token: contextMenuInstanceToken });

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
      if (isContextMenuInstanceSelected) {
        contextMenuChannel?.postMessage({ type: 'unregister', token: contextMenuInstanceToken });
      }
      contextMenuChannel?.removeEventListener('message', onContextMenuMessage);
      contextMenuChannel?.close();
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
