import {
  ServerAPI,
  afterPatch,
  findInReactTree,
  findSP,
  replacePatch,
  callOriginal,
  RoutePatch,
  wrapReactType,
} from 'decky-frontend-lib';

import { libraryAssetImageClasses, appportraitClasses, homeCarouselClasses } from '../static-classes';
import { rerenderAfterPatchUpdate } from "./patchUtils";

let patch: RoutePatch | undefined;
let shouldPatch = false;

export const addSquareHomePatch = (serverApi: ServerAPI, mounting: boolean = false) => {
// export const addSquareHomePatch = (serverApi: ServerAPI) => {
  shouldPatch = true;
  // inject css if it isn't there already
  if (!findSP().window.document.getElementById('sgdb-square-capsules-home')) {
    const styleEl = findSP().window.document.createElement('style');
    styleEl.id = 'sgdb-square-capsules-home';
    styleEl.textContent = `
      /* only select home page */
      .${appportraitClasses.InRecentGames} .${libraryAssetImageClasses.Container}.${libraryAssetImageClasses.PortraitImage} {
        padding-top: 100% !important;
      }
    `;
    findSP().window.document.head.append(styleEl);
  }

  // ! This shouldn't be needed but there's some serious jank with the homepage route.
  patch ??= serverApi.routerHook.addPatch('/library/home', (props) => {
    afterPatch(props.children, 'type', (_: Record<string, unknown>[], ret?: any) => {
      console.log('ret:', ret);

      // wrapReactType(ret, 'type');
      afterPatch(ret.type, 'type', (_: Record<string, unknown>[], ret2?: any) => {
        // console.info('ret2', ret2);

        let cache3: any = null;
        const recents = findInReactTree(ret2, (x) => x?.props && ('autoFocus' in x.props) && ('showBackground' in x.props));
        console.log("recents:", recents);

        // wrapReactType(recents, 'type');
        afterPatch(recents.type, 'type', (_: Record<string, unknown>[], ret3?: any) => {
          // console.info('ret3', ret3);

          if (cache3) {
            ret3 = cache3;
            return ret3;
          }

          const p = findInReactTree(ret3, (x) => x?.props?.games && x?.props.onItemFocus);
          afterPatch(p, 'type', (_: Record<string, unknown>[], ret4?: any) => {
            console.log("ret4:", ret4);

            cache3 = ret3;

            // wrapReactType(ret4, 'type');
            afterPatch(ret4.type, 'type', (_: Record<string, unknown>[], ret5?: any) => {
              // console.info('ret5', ret5);

              if (shouldPatch) {
                const size = ret5.props.children.props.children.props.nItemHeight;
                ret5.props.children.props.children.props.nItemHeight = size;

                replacePatch(ret5.props.children.props.children.props, 'fnGetColumnWidth', ([index]) => {
                  // Leave horizontal grid as wide
                  if (index === 0 ) {
                    return callOriginal;
                  }
                  return size - parseInt(homeCarouselClasses.LabelHeight); // this is how valve does it -.-
                });
              }
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
  rerenderAfterPatchUpdate();
  // if (!mounting) rerenderAfterPatchUpdate();
};

export function removeSquareHomePatch(serverApi: ServerAPI, unmounting: boolean = false): void {
  if (patch) {
    // ! This should work but it doesn't, thanks valve.
    // serverApi.routerHook.removePatch('/library/home', patch);
    // patch = undefined;

    // ? Janky workaround.
    if (unmounting) serverApi.routerHook.removePatch('/library/home', patch);
    shouldPatch = false;

    if (!unmounting) rerenderAfterPatchUpdate();
  }
}