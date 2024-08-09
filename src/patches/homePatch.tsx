import {
  afterPatch,
  findInReactTree,
  findSP,
  replacePatch,
  callOriginal,
  wrapReactType,
} from '@decky/ui';
import { RoutePatch, routerHook } from '@decky/api';

import { libraryAssetImageClasses, appportraitClasses, homeCarouselClasses } from '../static-classes';

import { rerenderAfterPatchUpdate } from './patchUtils';

let patch: RoutePatch | undefined;

/*
  Calculating the same way Steam does it
  175/262.5 is a hardcoded value in the library code
  Might break if user is changing asset container sizes via CSS
 */
const calculateDefaultCapsuleWidth = (newHeight: number) => {
  const originalWidth = 175;
  const originalHeight = 262.5;
  const ratio = originalWidth / originalHeight;
  return newHeight * ratio;
};

export const addHomePatch = (mounting = false, square = false, matchFeatured = false) => {
  // inject css if it isn't there already
  const styleEl = findSP().window.document.getElementById('sgdb-square-capsules-home');
  if (square && !styleEl) {
    const styleEl = findSP().window.document.createElement('style');
    styleEl.id = 'sgdb-square-capsules-home';
    styleEl.textContent = `
      /* only select home page */
      .${appportraitClasses.InRecentGames} .${libraryAssetImageClasses.Container}.${libraryAssetImageClasses.PortraitImage} {
        padding-top: 100% !important;
      }
    `;
    findSP().window.document.head.append(styleEl);
  } else if (!square && styleEl) {
    styleEl?.remove();
  }

  patch = routerHook.addPatch('/library/home', (props) => {
    afterPatch(props.children, 'type', (_: Record<string, unknown>[], ret?: any) => {
      let cache2: any = null;

      wrapReactType(ret);
      afterPatch(ret.type, 'type', (_: Record<string, unknown>[], ret2?: any) => {
        if (cache2) {
          ret2 = cache2;
          return ret2;
        }

        let cache3: any = null;
        const recents = findInReactTree(ret2, (x) => x?.props && ('autoFocus' in x.props) && ('showBackground' in x.props));

        wrapReactType(recents);
        afterPatch(recents.type, 'type', (_: Record<string, unknown>[], ret3?: any) => {
          cache2 = ret2;

          wrapReactType(ret3);

          if (cache3) {
            ret3 = cache3;
            return ret3;
          }

          const p = findInReactTree(ret3, (x) => x?.props?.games && x?.props.onItemFocus);
          afterPatch(p, 'type', (_: Record<string, unknown>[], ret4?: any) => {
            cache3 = ret3;

            wrapReactType(ret4);
            afterPatch(ret4.type, 'type', (_: Record<string, unknown>[], ret5?: any) => {
              const size = ret5.props.children.props.children.props.nItemHeight;

              /*
                Instead of hacking around with CSS to make the image square, make the featured
                item render the portrait component by changing the `bFeatured` flag to false.

                To get the first item in recents, Valve checks if the index is 0:
                  `bFeatured: 0 === t,`
                Can't get the index of the element from `fnItemRenderer`, so we just just check if the current
                position of the item (`nLeft`) in the carousel is leftmost (0) or out of the screen (negative float)
              */
              if (matchFeatured) {
                afterPatch(ret5.props.children.props.children.props, 'fnItemRenderer', (_: Record<string, unknown>[], ret6?: any) => {
                  if (ret6.props.nLeft <= 0 && ret6.props.bFeatured) {
                    ret6.props.bFeatured = false;
                  }
                  return ret6;
                });
              }

              /* Unminified version of `fnGetColumnWidth`:
                if (index === 0 && showFeaturedItem) {
                  return (690 / 215) * nItemWidth;
                } else if (games[index] === 0) { // not so sure about this
                  return 10;
                } else {
                  return nItemWidth;
                }
              */
              replacePatch(ret5.props.children.props.children.props, 'fnGetColumnWidth', ([index]) => {
                // Leave horizontal grid as wide
                if (index === 0 && !matchFeatured) {
                  return callOriginal;
                }

                /* this is how valve does it -.-
                  height: a - parseInt(or().LabelHeight)
                */
                const capsuleHeight = size - parseInt(homeCarouselClasses.LabelHeight);
                if (square) {
                  return capsuleHeight;
                }
                return calculateDefaultCapsuleWidth(capsuleHeight);
              });
              return ret5;
            });
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

  // ? Always rerender bc onMount users land here too.
  // rerenderAfterPatchUpdate();
  if (!mounting) rerenderAfterPatchUpdate();
};

export function removeHomePatch(unmounting = false): void {
  if (patch) {
    findSP().window.document.getElementById('sgdb-square-capsules-home')?.remove();
    routerHook.removePatch('/library/home', patch);
    patch = undefined;

    if (!unmounting) rerenderAfterPatchUpdate();
  }
}