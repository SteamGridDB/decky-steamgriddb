import {
  ServerAPI,
  afterPatch,
  findInReactTree,
  findSP,
  replacePatch,
  callOriginal,
} from 'decky-frontend-lib';

import { libraryAssetImageClasses, appportraitClasses, homeCarouselClasses } from './static-classes';

const squareHomePatch = (serverApi: ServerAPI) => {
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

  return serverApi.routerHook.addPatch('/library/home', (props) => {
    afterPatch(props.children, 'type', (_: Record<string, unknown>[], ret?: any) => {
      // console.info('ret', ret);
      afterPatch(ret.type, 'type', (_: Record<string, unknown>[], ret2?: any) => {
        let cache3: any = null;
        // console.info('ret2', ret2);
        const recents = findInReactTree(ret2, (x) => x?.props && ('autoFocus' in x.props) && ('showBackground' in x.props));
        afterPatch(recents.type, 'type', (_: Record<string, unknown>[], ret3?: any) => {
          // console.info('ret3', ret3);
          if (cache3) {
            ret3 = cache3;
            return ret3;
          }
          const p = findInReactTree(ret3, (x) => x?.props?.games && x?.props.onItemFocus);
          afterPatch(p, 'type', (_: Record<string, unknown>[], ret4?: any) => {
            cache3 = ret3;
            // console.info('ret4', ret4);
            afterPatch(ret4.type, 'type', (_: Record<string, unknown>[], ret5?: any) => {
              // console.info('ret5', ret5);
              const size = ret5.props.children.props.children.props.nItemHeight;
              ret5.props.children.props.children.props.nItemHeight = size;
              replacePatch(ret5.props.children.props.children.props, 'fnGetColumnWidth', ([index]) => {
                // Leave horizontal grid as wide
                if (index === 0) {
                  return callOriginal;
                }
                return size - parseInt(homeCarouselClasses.LabelHeight); // this is how valve does it -.-
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
};

export default squareHomePatch;