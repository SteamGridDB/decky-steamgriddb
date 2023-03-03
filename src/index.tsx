import {
  definePlugin,
  ServerAPI,
  quickAccessMenuClasses,
  afterPatch,
  fakeRenderComponent,
  findInReactTree,
  findInTree,
  MenuItem,
  Navigation,
  Patch,
} from 'decky-frontend-lib';

import QuickAccessSettings from './QuickAccessSettings';
import MenuIcon from './components/Icons/MenuIcon';
import { SGDBProvider } from './hooks/useSGDB';
import { SettingsProvider } from './hooks/useSettings';
import SGDBPage from './SGDBPage';
import t from './utils/i18n';
import log from './utils/log';

// Add button second to last
const spliceArtworkItem = (children: any[], appid: number) => {
  children.splice(-1, 0, (
    <MenuItem
      key="sgdb-change-artwork"
      onSelected={() => {
        Navigation.Navigate(`/steamgriddb/${appid}`);
      }}
    >
      {t('ACTION_CHANGE_ARTWORK', 'Change artwork...')}
    </MenuItem>
  ));
};

async function getMenu() {
  // @ts-ignore: decky global is not typed
  while (!window.DeckyPluginLoader?.routerHook?.routes) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  let LibraryContextMenu = findInReactTree(
    fakeRenderComponent(
      findInTree(
        fakeRenderComponent(
          // @ts-ignore: decky global is not typed
          window.DeckyPluginLoader.routerHook.routes.find((x) => x?.props?.path == '/zoo').props.children.type
        ), (x) => x?.route === '/zoo/modals',
        {
          walkable: ['props', 'children', 'child', 'pages'],
        }
      ).content.type
    ),
    (x) => x?.title?.includes('AppActionsMenu')
  ).children.type;

  if (!LibraryContextMenu?.prototype?.AddToHidden) {
    LibraryContextMenu = fakeRenderComponent(LibraryContextMenu).type;
  }
  return LibraryContextMenu;
}

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

  let patchedMenu: Patch | undefined;

  getMenu().then((LibraryContextMenu) => {
    patchedMenu = afterPatch(LibraryContextMenu.prototype, 'render', (_: Record<string, unknown>[], component: any) => {
      log(component);
      const appid: number = component._owner.pendingProps.overview.appid;
      afterPatch(component.type.prototype, 'shouldComponentUpdate', ([nextProps]: any, shouldUpdate: any) => {
        if (shouldUpdate === true && !nextProps.children.find((x: any) => x?.key === 'sgdb-change-artwork')) {
          let updatedAppid: number = appid;
          // find the first menu component that has the correct appid assigned to _owner
          const parentOverview = nextProps.children.find((x: any) =>
            x?._owner?.pendingProps?.overview?.appid &&
            x._owner.pendingProps.overview.appid !== appid
          );
          // if found then use that appid
          if (parentOverview) {
            updatedAppid = parentOverview._owner.pendingProps.overview.appid;
          }
          spliceArtworkItem(nextProps.children, updatedAppid);
        }
        return shouldUpdate;
      }, { singleShot: true });

      spliceArtworkItem(component.props.children, appid);
      return component;
    });
  });

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <SettingsProvider serverApi={serverApi}><QuickAccessSettings serverApi={serverApi} /></SettingsProvider>,
    icon: <MenuIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute('/steamgriddb/:appid/:assetType?');
      patchedMenu?.unpatch();
    },
  };
});
