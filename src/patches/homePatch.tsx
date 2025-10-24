import {
  afterPatch,
  findInReactTree,
  findSP,
  replacePatch,
  callOriginal,
  wrapReactType,
} from '@decky/ui';
import { RoutePatch, routerHook } from '@decky/api';

import { libraryAssetImageClasses, appportraitClasses, homeCarouselClasses, miscInfoClasses } from '../static-classes';
// import LibraryImage from '../components/asset/LibraryImage';
// import { ASSET_TYPE } from '../constants';
import { addStyle, removeStyle } from '../utils/styleInjector';

import { rerenderAfterPatchUpdate } from './patchUtils';

let patch: RoutePatch | undefined;

/*
  Calculating the same way Steam does it
  175/262.5 is a hardcoded value in the library code
  Used as a fallback for first (?) render while afterPatch runs to get width
  Might break if user is changing asset container sizes via CSS, but only once
 */
const calculateDefaultCapsuleWidth = (newHeight: number) => {
  const originalWidth = 175;
  const originalHeight = 262.5;
  const ratio = originalWidth / originalHeight;
  return newHeight * ratio;
};

export const addHomePatch = (mounting = false, square = false, matchFeatured = false, carouselLogo = false) => {
  if (square) {
    addStyle('sgdb-square-capsules-home', `
      /* only select home page */
      .${appportraitClasses.InRecentGames} .${libraryAssetImageClasses.Container}.${libraryAssetImageClasses.PortraitImage} {
        padding-top: 100% !important;
      }
    `);
  } else {
    removeStyle('sgdb-square-capsules-home');
  }

  if (carouselLogo) {
    addStyle('sgdb-carousel-logo', `
      .${homeCarouselClasses.CarouselGameLabelWrapper} {
        /* margin-top: -30px; */
      }
      /* allow drop-shadow to extend outside containers */
      .${homeCarouselClasses.CarouselGameLabelWrapper} .${miscInfoClasses.Container},
      .${homeCarouselClasses.CarouselGameLabelWrapper} > div > div { /* this is bleh */
        overflow: visible;
      }
      /* parent container of .sgdb-carousel-logo-container */
      .${homeCarouselClasses.CarouselGameLabelWrapper} .${miscInfoClasses.Content} {
        width: 100%; /* full width of capsule box so logo can be centered */
      }
      .sgdb-carousel-logo-container {
        width: inherit; /* inherit above */
        height: 39px; /* exact height of the replaced text box on unmodified steam css */
        filter: drop-shadow(0 1px 1px #000) drop-shadow(0 4px 6px rgba(255, 255, 255, .4));
        overflow: visible;
      }
      .sgdb-carousel-logo-img {
        height: 100%;
        width: 100%;
        object-fit: contain;
        object-position: center top;
      }
    `);
  } else {
    removeStyle('sgdb-carousel-logo');
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

          if (cache3) {
            ret3 = cache3;
            return ret3;
          }

          const p = findInReactTree(ret3, (x) => x?.props?.games && x?.props.onItemFocus);
          afterPatch(p, 'type', (_: Record<string, unknown>[], ret4?: any) => {
            // const cache6: any[] = []; // cache carousel items
            cache3 = ret3;

            wrapReactType(ret4);
            afterPatch(ret4.type, 'type', (_: Record<string, unknown>[], ret5?: any) => {
              const carouselProps = findInReactTree(ret5, (x) => x?.nItemHeight && x?.fnItemRenderer && x?.fnGetColumnWidth);
              const itemHeight = carouselProps.nItemHeight;
              let hasSeparator = false;
              /*
                Instead of hacking around with CSS to make the image square, make the featured
                item render the portrait component by changing the `bFeatured` flag to false.

                To get the first item in recents, Valve checks if the index is 0:
                  `bFeatured: 0 === t,`
                Can't get the index of the element from `fnItemRenderer`, so we just just check if the current
                position of the item (`nLeft`) in the carousel is leftmost (0) or out of the screen (negative float)
              */
              afterPatch(carouselProps, 'fnItemRenderer', (_: Record<string, unknown>[], ret6?: any) => {
                if (ret6.props.nLeft <= 0 && ('bFeatured' in ret6.props)) {
                  ret6.props.bFeatured = !matchFeatured;
                }

                // find the separator item if it's there
                if (
                  !('bFeatured' in ret6.props) &&
                  ret6.props?.focusable === false &&
                  ret6.props?.className?.includes(homeCarouselClasses.FeaturedSeparator)
                ) {
                  hasSeparator = true;
                }

                /*
                  Experimental logo in carousel
                */
                /* if (carouselLogo && ret6.type.type && ret6.props?.appid) {
                  if (cache6[ret6.props?.appid]) {
                    ret6 = cache6[ret6.props?.appid];
                    return ret6;
                  }
                  wrapReactType(ret6);
                  afterPatch(ret6.type, 'type', (_: Record<string, unknown>[], ret7?: any) => {
                    const c1 = findInReactTree(ret7, (x) => x?.props && x.props.className && x.props?.style?.width && x.props?.style?.height);
                    const c2 = findInReactTree(balls, (x) => x?.props && ('bShowAsHovered' in x.props) && ('nCarouselWidth' in x.props));
                    const app = c2.props.app;
                    // outside carousel?
                    c1.props.children.splice(1, 0, (
                      <LibraryImage
                        app={app}
                        className="sgdb-carousel-logo-container"
                        imageClassName="sgdb-carousel-logo-img"
                        eAssetType={ASSET_TYPE.logo}
                        allowCustomization={false}
                        backgroundType="transparent"
                        neverShowTitle={false}
                        bShortDisplay
                      />
                    ));
                    // replace the text inside the marquee
                    wrapReactType(c2);
                    afterPatch(c2.type, 'type', (_: Record<string, unknown>[], ret8?: any) => {
                      if (ret8) {
                        // console.log(ret8);
                        ret8.props.children.props.children[0].props.message = (
                          <LibraryImage
                            app={app}
                            className="sgdb-carousel-logo-container"
                            imageClassName="sgdb-carousel-logo-img"
                            eAssetType={ASSET_TYPE.logo}
                            allowCustomization={false}
                            backgroundType="transparent"
                            neverShowTitle={false}
                            bShortDisplay
                          />
                        );
                      }
                      return ret8;
                    });
                    return ret7;
                  });
                  cache6[ret6.props?.appid] = ret6;
                }
                */
                return ret6;
              });

              /* Unminified version of `fnGetColumnWidth`:
                if (index === 0 && showFeaturedItem) {
                  return (690 / 215) * nItemWidth;
                } else if (games[index] === 0) { // not so sure about this
                  return 10;
                } else {
                  return nItemWidth;
                }
              */
              let siblingWidth = 0;
              afterPatch(carouselProps, 'fnGetColumnWidth', ([index], colWidth: number) => {
                if (hasSeparator && index === 2) {
                  siblingWidth = colWidth;
                } else if (!hasSeparator && index === 1) {
                  siblingWidth = colWidth;
                }
                return colWidth;
              });
              replacePatch(carouselProps, 'fnGetColumnWidth', ([index]) => {
                // Leave horizontal grid as wide
                if (index === 0 && !matchFeatured) return callOriginal;

                /* this is how valve does it -.-
                  height: a - parseInt(or().LabelHeight)
                */
                const capsuleHeight = itemHeight - parseInt(homeCarouselClasses.LabelHeight);
                // the separator item should not be changed
                if (index === 1 && hasSeparator) {
                  return callOriginal;
                }
                if (square) return capsuleHeight;
                return siblingWidth ? siblingWidth : calculateDefaultCapsuleWidth(capsuleHeight);
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