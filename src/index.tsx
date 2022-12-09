import {
  definePlugin,
  ServerAPI,
  quickAccessMenuClasses,
  afterPatch,
  findModuleChild,
  MenuItem,
  Router,
} from 'decky-frontend-lib';

import QuickAccessSettings from './QuickAccessSettings';
import MenuIcon from './components/Icons/MenuIcon';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './SGDBPage';
import t from './utils/i18n';
import log from './utils/log';

const AppContextMenu = findModuleChild((m) => {
  if (typeof m !== 'object') return;
  for (const prop in m) {
    if (
      m[prop]?.toString &&
      m[prop].toString().includes('omitPrimaryAction') &&
      m[prop]?.prototype?.AddToFavorites &&
      m[prop]?.prototype?.AddToNewCollection
    ) return m[prop];
  }
  return;
});

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute('/steamgriddb/:appid/:assetType?', () => (
    <SettingsProvider serverApi={serverApi}>
      <SGDBProvider serverApi={serverApi}>
        <SGDBPage />
      </SGDBProvider>
    </SettingsProvider>
  ), {
    exact: true,
  });

  const patchedMenu = afterPatch(AppContextMenu.prototype, 'render', (_: Record<string, unknown>[], component: any) => {
    log(component);
    const appid = component._owner.pendingProps.overview.appid;
    component._owner.stateNode?.m_hAppDetails?.unregister();

    // Add button second to last
    component.props.children.splice(-1, 0, (
      <MenuItem
        key="sgdb-change-artwork"
        onSelected={() => {
          Router.Navigate(`/steamgriddb/${appid}`);
        }}
      >
        {t('ACTION_CHANGE_ARTWORK', 'Change artwork...')}
      </MenuItem>
    ));
    return component;
  });

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <QuickAccessSettings serverAPI={serverApi} />,
    icon: <MenuIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute('/steamgriddb/:appid/:assetType?');
      patchedMenu?.unpatch();
    },
  };
});
