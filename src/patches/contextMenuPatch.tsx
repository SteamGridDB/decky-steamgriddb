import {
  afterPatch,
  fakeRenderComponent,
  findInReactTree,
  findModuleByExport,
  Export,
  MenuItem,
  Navigation,
  Patch,
  findInTree,
} from '@decky/ui';
import { FC } from 'react';

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

// Check if correct menu by looking at the code of the onSelected function
// Should be enough to ignore the screenshots and other menus.
const isOpeningAppContextMenu = (items: any[]) => {
  if (!items?.length) {
    return false;
  }
  return !!findInReactTree(items, (x) => x?.props?.onSelected && x?.props?.onSelected.toString().includes('launchSource'));
};

const handleItemDupes = (items: any[]) => {
  const sgdbIdx = items.findIndex((x: any) => x?.key === 'sgdb-change-artwork');
  if (sgdbIdx != -1) items.splice(sgdbIdx, 1);
};

const patchMenuItems = (menuItems: any[], appid: number) => {
  let updatedAppid: number = appid;
  // find the first menu component that has the correct appid, sometimes the one passed is cached from another context menu
  const parentOverview = menuItems.find((x: any) => x?._owner?.pendingProps?.overview?.appid &&
    x._owner.pendingProps.overview.appid !== appid
  );
  // if found then use that appid
  if (parentOverview) {
    updatedAppid = parentOverview._owner.pendingProps.overview.appid;
  }
  // Oct 2025 client
  if (updatedAppid === appid) {
    const foundApp = findInTree(menuItems, (x) => x?.app?.appid, { walkable: ['props', 'children'] });
    if (foundApp) {
      updatedAppid = foundApp.app.appid;
    }
  }
  spliceArtworkItem(menuItems, updatedAppid);
};

/**
 * Patches the game context menu.
 * @param LibraryContextMenu The game context menu, or undefined if it could not be found.
 * @returns A patch to remove when the plugin dismounts.
 */
const contextMenuPatch = (LibraryContextMenu: any) => {
  const patches: {
    outer?: Patch,
    inner?: Patch,
    unpatch: () => void;
  } = { unpatch: () => {return null;} };

  // Fail-soft: without a valid component there is nothing to patch, the menu item is simply not added.
  if (!LibraryContextMenu?.prototype?.render) {
    console.warn('[SGDB] LibraryContextMenu unavailable; skipping context menu patch');
    return patches;
  }

  patches.outer = afterPatch(LibraryContextMenu.prototype, 'render', (_: Record<string, unknown>[], component: any) => {
    try {
      log(component);
      let appid: number = 1018880;
      if (component._owner) {
        appid = component._owner.pendingProps.overview.appid;
      } else {
        // Oct 2025 client
        const foundApp = findInTree(component.props.children, (x) => x?.app?.appid, { walkable: ['props', 'children'] });
        if (foundApp) {
          appid = foundApp.app.appid;
        }
      }

      if (!patches.inner) {
        patches.inner = afterPatch(component, 'type', (_: any, ret: any) => {
          try {
            // initial render
            afterPatch(ret.type.prototype, 'render', (_: any, ret2: any) => {
              try {
                const menuItems = ret2.props.children[0]; // always the first child
                if (!isOpeningAppContextMenu(menuItems)) return ret2;
                try {
                  handleItemDupes(menuItems);
                } catch (error) {
                  return ret2;
                }
                patchMenuItems(menuItems, appid);
              } catch (error) {
                console.warn('[SGDB] Failed to patch context menu render', error);
              }
              return ret2;
            });

            // when steam decides to regresh app overview
            afterPatch(ret.type.prototype, 'shouldComponentUpdate', ([nextProps]: any, shouldUpdate: any) => {
              try {
                try {
                  handleItemDupes(nextProps.children);
                } catch (error) {
                  // wrong context menu (probably)
                  return shouldUpdate;
                }

                if (shouldUpdate === true) {
                  patchMenuItems(nextProps.children, appid);
                }
              } catch (error) {
                console.warn('[SGDB] Failed to patch context menu update', error);
              }

              return shouldUpdate;
            });
          } catch (error) {
            console.warn('[SGDB] Failed to patch inner context menu component', error);
          }
          return ret;
        });
      } else {
        spliceArtworkItem(component.props.children, appid);
      }
    } catch (error) {
      console.warn('[SGDB] Failed to patch library context menu', error);
    }
    return component;
  });
  patches.unpatch = () => {
    patches.outer?.unpatch();
    patches.inner?.unpatch();
  };
  return patches;
};

/**
 * Looks up the game context menu component.
 *
 * Done lazily and defensively: on newer Steam clients the minified module may not
 * match anymore, in which case this returns undefined and only the
 * "Change Artwork..." menu item is disabled instead of the whole plugin failing to load.
 * @returns The LibraryContextMenu component class, or undefined if it could not be found.
 */
export const getLibraryContextMenu = (): any | undefined => {
  try {
    const module = findModuleByExport((e: Export) => e?.toString && e.toString().includes('().LibraryContextMenu'));
    if (!module) {
      throw new Error('module not found');
    }
    const sibling = Object.values(module).find((sibling: any) => (
      sibling?.toString?.().includes('navigator:')
    ));
    if (!sibling) {
      throw new Error('component export not found');
    }
    const LibraryContextMenu = fakeRenderComponent(sibling as FC)?.type;
    if (!LibraryContextMenu?.prototype?.render) {
      throw new Error('rendered component has no render prototype');
    }
    return LibraryContextMenu;
  } catch (error) {
    console.warn('[SGDB] LibraryContextMenu not found; "Change Artwork..." menu item disabled', error);
    return undefined;
  }
};

export default contextMenuPatch;
