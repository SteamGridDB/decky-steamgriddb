import {
  afterPatch,
  findInTree,
  findInReactTree,
  wrapReactType,
  findSP,
} from '@decky/ui';
import { RoutePatch, routerHook } from '@decky/api';

import { gamepadLibraryClasses, libraryAssetImageClasses } from '../static-classes';
import { addStyle } from '../utils/styleInjector';

import { rerenderAfterPatchUpdate } from './patchUtils';

let patch: RoutePatch | undefined;

// Stores patched components keyed by Tab ID to prevent infinite loops
const tabContentCache = new Map<string, any>();

const patchGridProps = (props: any) => {
  const gridProps = findInTree(props, (x) => x?.childWidth, { walkable: ['props', 'children', 'childSections'] });
  if (gridProps) {
    gridProps.childHeight = gridProps.childWidth;
  }
};

// Helper uses a cache key (Tab ID) to reuse wrappers, preventing infinite re-render
const patchDeepComponent = (element: any, cacheKey: string, patcher: (args: any[], ret: any) => any) => {
  if (!element || !element.type) return;

  if (tabContentCache.has(cacheKey)) {
    element.type = tabContentCache.get(cacheKey);
    return;
  }

  try {
    wrapReactType(element.type);
    afterPatch(element, 'type', patcher);
    tabContentCache.set(cacheKey, element.type);
  } catch (e) {
    console.error('[Square Art] Failed to patch component:', e);
  }
};

export const addSquareLibraryPatch = (mounting = false) => {
  patch = routerHook.addPatch('/library', (props) => {
    addStyle('sgdb-square-capsules-library', `
      .${gamepadLibraryClasses.GamepadLibrary} .${libraryAssetImageClasses.Container}.${libraryAssetImageClasses.PortraitImage} {
        padding-top: 100% !important;
        height: 0 !important;
      }
    `);

    afterPatch(props.children, 'type', (_: Record<string, unknown>[], ret?: any) => {
      
      let tabsWrapperCache: any = null;

      afterPatch(ret, 'type', (_: Record<string, unknown>[], ret2?: any) => {
        
        if (tabsWrapperCache) {
          ret2.type = tabsWrapperCache;
          return ret2;
        }

        wrapReactType(ret2);

        afterPatch(ret2.type, 'type', (_: Record<string, unknown>[], ret3?: any) => {
          tabsWrapperCache = ret2.type;

          const { tabs, activeTab } = findInReactTree(ret3, (x) => x?.tabs && x?.activeTab);
          const tab = tabs?.find((x: any) => x.id == activeTab);

          if (!tab || tab.content.props?.collectionid === null) { 
            return ret3;
          }

          if (tab.content.props.children || tab.content.props.collection || tab.content.type) { 
            const collection = tab.content.props?.children || tab.content;
            const uniqueTabKey = activeTab || 'unknown-tab';

            patchDeepComponent(collection, uniqueTabKey, (_: Record<string, unknown>[], ret4) => {
              if (!ret4) return ret4;

              const p1 = findInReactTree(ret4, (x) => x?.type && x.props?.appOverviews);
              const coverSizeComponent = findInReactTree(ret4.props.children, (x) => x?.type && x.type.toString().includes('coverSize'));

              if (p1 && collection) {
                // Main Library (Installed, All Games)
                // Patch component type so we can intercept the OUTPUT (ret5)
                patchDeepComponent(p1, `${uniqueTabKey}_grid`, (_: Record<string, unknown>[], ret5) => {
                    patchGridProps(ret5); // Modifying the rendered output fixes the selection border
                    return ret5;
                });
              } else if (coverSizeComponent) {
                return ret4;
              } else {
                if (ret4.props.children[0]?.props?.collectionid) {
                  // User Collections
                  const collectionContainer = ret4.props.children[0];
                  
                  patchDeepComponent(collectionContainer, `${uniqueTabKey}_container`, (_: Record<string, unknown>[], ret5) => {
                    const innerC = findInReactTree(ret5, (x) => x?.type && x.props?.collection?.id);
                    if (innerC) {
                        const innerId = innerC.props?.collection?.id || 'inner';
                        patchDeepComponent(innerC, `${uniqueTabKey}_${innerId}`, (_: Record<string, unknown>[], ret6) => {
                            const grid = findInReactTree(ret6, (x) => x?.type && x.props?.appOverviews);
                            
                            if (grid) {
                                // Patch the grid inside the collection
                                patchDeepComponent(grid, `${uniqueTabKey}_${innerId}_grid`, (_: Record<string, unknown>[], ret7) => {
                                    patchGridProps(ret7); // Fix dimensions on output
                                    return ret7;
                                });
                            }
                            return ret6;
                        });
                    }
                    return ret5;
                  });

                } else {
                  // Non-Steam Shortcuts
                  const p2 = findInReactTree(ret4, (x) => x?.type && x.props?.collection?.id === 'deck-desktop-apps');
                  
                  if (p2) {
                      patchDeepComponent(p2, 'deck-desktop-apps-container', (_: Record<string, unknown>[], ret5) => {
                        const grid = findInReactTree(ret5, (x) => x?.type && x.props?.appOverviews);
                        
                        if (grid) {
                            // Patch the grid inside Non-Steam
                            patchDeepComponent(grid, 'deck-desktop-apps-grid', (_: Record<string, unknown>[], ret6) => {
                                patchGridProps(ret6); // Fix dimensions on output
                                return ret6;
                            });
                        }
                        return ret5;
                      });
                  }
                }
              }
              return ret4;
            });
          }
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

export function removeSquareLibraryPatch(unmounting = false): void {
  tabContentCache.clear();
  if (patch) {
    findSP().window.document.getElementById('sgdb-square-capsules-library')?.remove();
    routerHook.removePatch('/library', patch);
    patch = undefined;

    if (!unmounting) rerenderAfterPatchUpdate();
  }
}
