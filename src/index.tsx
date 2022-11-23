import {
  definePlugin,
  ServerAPI,
  quickAccessMenuClasses,
  findInReactTree,
} from 'decky-frontend-lib';

import QuickAccessSettings from './QuickAccessSettings';
import MenuIcon from './components/MenuIcon';
import patchLibraryAppPage from './patchLibraryAppPage';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './SGDBPage';

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute('/steamgriddb/:appid/:assetType?', () => <SettingsProvider serverApi={serverApi}>
    <SGDBProvider serverApi={serverApi}>
      <SGDBPage />
    </SGDBProvider>
  </SettingsProvider>, {
    exact: true,
  });

  // @ts-ignore _reactRootContainer exists on the window object
  const reactRoot = document.getElementById('root')._reactRootContainer._internalRoot.current;
  const findModalManager = findInReactTree(reactRoot, (x) => x.pendingProps?.DialogWrapper && x.pendingProps?.ModalManager);

  const appPagePath = patchLibraryAppPage(serverApi, findModalManager);

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <QuickAccessSettings serverAPI={serverApi} />,
    icon: <MenuIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute('/steamgriddb/:appid/:assetType?');
      serverApi.routerHook.removePatch('/library/app/:appid', appPagePath);
    },
  };
});
