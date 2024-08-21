import {
  afterPatch,
  findInTree,
  findInReactTree,
  wrapReactType,
  findSP,
  ServerAPI,
  RoutePatch,
} from 'decky-frontend-lib';

import { gamepadLibraryClasses, libraryAssetImageClasses } from '../static-classes';
import { addStyle } from '../utils/styleInjector';

import { rerenderAfterPatchUpdate } from './patchUtils';

let patch: RoutePatch | undefined;

const patchGridProps = (props: any) => {
  const gridProps = findInTree(props, (x) => x?.childWidth, { walkable: ['props', 'children', 'childSections'] });
  if (gridProps) {
    gridProps.childHeight = gridProps.childWidth;
  }
};

export const addSquareLibraryPatch = (serverApi: ServerAPI, mounting = false) => {
  patch = serverApi.routerHook.addPatch('/library', (props) => {
    // inject css if it isn't there already
    addStyle('sgdb-square-capsules-library', `
      /* only select covers within library page, otherwise it breaks covers on other pages */
      .${gamepadLibraryClasses.GamepadLibrary} .${libraryAssetImageClasses.Container}.${libraryAssetImageClasses.PortraitImage} {
        padding-top: 100% !important;
        height: 0 !important;
      }
    `);

    // lmao fuck is this
    afterPatch(props.children, 'type', (_: Record<string, unknown>[], ret?: any) => {
      // console.info('ret', ret);
      let cache: any = null;
      afterPatch(ret, 'type', (_: Record<string, unknown>[], ret2?: any) => {
        if (cache) {
          ret2.type = cache;
          return ret2;
        }
        wrapReactType(ret2);
        afterPatch(ret2.type, 'type', (_: Record<string, unknown>[], ret3?: any) => {
          cache = ret2.type;
          // console.info('ret3', ret3);

          const { tabs, activeTab } = findInReactTree(ret3, (x) => x?.tabs && x?.activeTab);
          const tab = tabs.find((x: any) => x.id == activeTab);
          const collection = tab.content.props.collection;
          // console.info('collection', collection);
          afterPatch(tab.content, 'type', (_: Record<string, unknown>[], ret4) => {
            // console.info('ret4', ret4);
            if (!ret4) return ret4;

            const p1 = findInReactTree(ret4, (x) => x?.type && x.props?.appOverviews);
            if (p1 && collection) {
              afterPatch(p1, 'type', (_: Record<string, unknown>[], ret5) => {
                // console.info('ret5', ret5);
                patchGridProps(ret5);
                return ret5;
              });
            } else if (findInReactTree(ret4.props.children, (x) => x?.type && x.type.toString().includes('coverSize'))) {
              // ignore collections page
              return ret4;
            } else {
              // console.info('ret4 sc', ret4);
              if (ret4.props.children[0].props?.collectionid) {
                // collections
                afterPatch(ret4.props.children[0], 'type', (_: Record<string, unknown>[], ret5) => {
                  // console.info('ret5 c', ret5);
                  afterPatch(findInReactTree(ret5, (x) => x?.type && x.props?.collection?.id), 'type', (_: Record<string, unknown>[], ret6) => {
                    // console.info('ret6 c', ret6);
                    afterPatch(findInReactTree(ret6, (x) => x?.type && x.props?.appOverviews), 'type', (_: Record<string, unknown>[], ret7) => {
                      // console.info('ret7 c', ret7);
                      patchGridProps(ret7);
                      return ret7;
                    });
                    return ret6;
                  });
                  return ret5;
                });
              } else {
                // non-steam shortcuts
                const p2 = findInReactTree(ret4, (x) => x?.type && x.props?.collection?.id === 'deck-desktop-apps');
                afterPatch(p2, 'type', (_: Record<string, unknown>[], ret5) => {
                  // console.info('ret5 s', ret5);
                  afterPatch(findInReactTree(ret5, (x) => x?.type && x.props?.appOverviews), 'type', (_: Record<string, unknown>[], ret6) => {
                    // console.info('ret6 s', ret6);
                    patchGridProps(ret6);
                    return ret6;
                  });
                  return ret5;
                });
              }
            }
            return ret4;
          });
          return ret3;
        });
        return ret2;
      });
      return ret;
    });
    return props;
  });

  if (!mounting) rerenderAfterPatchUpdate();
};

export function removeSquareLibraryPatch(serverApi: ServerAPI, unmounting = false): void {
  if (patch) {
    findSP().window.document.getElementById('sgdb-square-capsules-library')?.remove();
    serverApi.routerHook.removePatch('/library', patch);
    patch = undefined;

    if (!unmounting) rerenderAfterPatchUpdate();
  }
}