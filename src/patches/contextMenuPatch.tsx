import {
  afterPatch,
  fakeRenderComponent,
  findInReactTree,
  findModuleChild,
  MenuItem,
  Navigation,
} from 'decky-frontend-lib';

import t from '../utils/i18n';
import log from '../utils/log';

// Always add before "Properties..."
const spliceArtworkItem = (children: any[], appid: number) => {
  children.find((x: any) => x?.key === 'properties');
  const propertiesMenuItemIdx = children.findIndex((item) =>
    findInReactTree(item, (x) => x?.onSelected && x.onSelected.toString().includes('AppProperties'))
  );
  children.splice(propertiesMenuItemIdx, 0, (
    <MenuItem
      key="sgdb-change-artwork"
      onSelected={() => {
        Navigation.Navigate(`/steamgriddb/${appid}`);
      }}
    >
      {t('ACTION_CHANGE_ARTWORK', 'Change Artwork...')}
    </MenuItem>
  ));
};

const renderedMap = {};

/**
 * Patches the game context menu.
 * @param LibraryContextMenu The game context menu.
 * @returns A patch to remove when the plugin dismounts.
 */
const contextMenuPatch = (LibraryContextMenu: any) => {
  return afterPatch(LibraryContextMenu.prototype, 'render', (_: Record<string, unknown>[], component: any) => {
    log(component);
    const appid: number = component._owner.pendingProps.overview.appid;

    if (!Object.keys(renderedMap).includes(appid.toString()) && !window.location.pathname.endsWith('/routes/library/home')) {
      renderedMap[appid.toString()] = true;

      afterPatch(component.type.prototype, 'shouldComponentUpdate', ([nextProps]: any, shouldUpdate: any) => {
        const sgdbIdx = nextProps.children.findIndex((x: any) => x?.key === 'sgdb-change-artwork');
        if (sgdbIdx != -1) nextProps.children.splice(sgdbIdx, 1);

        if (shouldUpdate === true) {
          let updatedAppid: number = appid;
          // find the first menu component that has the correct appid assigned to _owner
          const parentOverview = nextProps.children.find((x: any) => x?._owner?.pendingProps?.overview?.appid &&
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
    } else {
      spliceArtworkItem(component.props.children, appid);
    }

    return component;
  });
};

/**
 * Gets the game context menu component.
 */
export const getMenu = async () => {
  // @ts-ignore: decky global is not typed
  while (!window.DeckyPluginLoader?.routerHook?.routes) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  let LibraryContextMenu = fakeRenderComponent(
    findModuleChild((m) => {
      if (typeof m !== 'object') return;
      for (const prop in m) {
        if (
          m[prop]?.toString() &&
          m[prop].toString().includes('().LibraryContextMenu')
        ) {
          return Object.values(m).find((sibling) => (
            sibling?.toString().includes('createElement') &&
            sibling?.toString().includes('navigator:')
          ));
        }
      }
      return;
    })
  ).type;

  if (!LibraryContextMenu?.prototype?.AddToHidden) {
    LibraryContextMenu = fakeRenderComponent(LibraryContextMenu).type;
  }
  return LibraryContextMenu;
};

export default contextMenuPatch;