import {
  afterPatch,
  fakeRenderComponent,
  findInReactTree,
  findModuleByExport,
  Export,
  MenuItem,
  Navigation,
  Patch,
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
  return items.findIndex((item) => findInReactTree(item, (x) => x?.onSelected &&
    x.onSelected.toString().includes('AddToNewCollection')
  )) !== -1;
};

const handleItemDupes = (items: any[]) => {
  const sgdbIdx = items.findIndex((x: any) => x?.key === 'sgdb-change-artwork');
  if (sgdbIdx != -1) items.splice(sgdbIdx, 1);
};

const patchMenuItems = (menuItems: any[], appid: number) => {
  let updatedAppid: number = appid;
  // find the first menu component that has the correct appid assigned to _owner
  const parentOverview = menuItems.find((x: any) => x?._owner?.pendingProps?.overview?.appid &&
    x._owner.pendingProps.overview.appid !== appid
  );
  // if found then use that appid
  if (parentOverview) {
    updatedAppid = parentOverview._owner.pendingProps.overview.appid;
  }
  spliceArtworkItem(menuItems, updatedAppid);
};

/**
 * Patches the game context menu.
 * @param LibraryContextMenu The game context menu.
 * @returns A patch to remove when the plugin dismounts.
 */
const contextMenuPatch = (LibraryContextMenu: any) => {
  const patches: {
    outer?: Patch,
    inner?: Patch,
    unpatch: () => void;
  } = { unpatch: () => {return null;} };
  patches.outer = afterPatch(LibraryContextMenu.prototype, 'render', (_: Record<string, unknown>[], component: any) => {
    log(component);
    const appid: number = component._owner.pendingProps.overview.appid;

    if (!patches.inner) {
      patches.inner = afterPatch(component, 'type', (_: any, ret: any) => {
        // initial render
        afterPatch(ret.type.prototype, 'render', (_: any, ret2: any) => {
          const menuItems = ret2.props.children[0]; // always the first child
          if (!isOpeningAppContextMenu(menuItems)) return ret2;
          try {
            handleItemDupes(menuItems);
          } catch (error) {
            // wrong context menu (probably)
            return ret2;
          }
          patchMenuItems(menuItems, appid);
          return ret2;
        });

        // when steam decides to regresh app overview
        afterPatch(ret.type.prototype, 'shouldComponentUpdate', ([nextProps]: any, shouldUpdate: any) => {
          try {
            handleItemDupes(nextProps.children);
          } catch (error) {
            // wrong context menu (probably)
            return shouldUpdate;
          }

          if (shouldUpdate === true) {
            patchMenuItems(nextProps.children, appid);
          }

          return shouldUpdate;
        });
        return ret;
      });
    } else {
      spliceArtworkItem(component.props.children, appid);
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
 * Game context menu component.
 */
export const LibraryContextMenu = fakeRenderComponent(
  Object.values(
    findModuleByExport((e: Export) => e?.toString && e.toString().includes('().LibraryContextMenu'))
  ).find((sibling) => (
    sibling?.toString().includes('createElement') &&
    sibling?.toString().includes('navigator:')
  )) as FC
).type;

export default contextMenuPatch;