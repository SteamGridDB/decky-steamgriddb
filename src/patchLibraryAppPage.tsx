import {
  MenuItem,
  Router,
  ServerAPI,
  afterPatch,
  wrapReactType,
  wrapReactClass,
  findInReactTree
} from 'decky-frontend-lib';
import { ReactElement, cloneElement } from 'react';

export default function (serverApi: ServerAPI) {
  return serverApi.routerHook.addPatch('/library/app/:appid', (props: { path: string; children: ReactElement }) => {
    console.log('pathxx', props.path);
    // @ts-ignore
    const reactRoot = document.getElementById('root')._reactRootContainer._internalRoot.current;
    const findModalWrap = findInReactTree(reactRoot, (x) => x.pendingProps?.DialogWrapper && x.pendingProps?.ModalManager);
    console.info('wooo', findModalWrap);
    wrapReactType(findModalWrap.type);
    afterPatch(findModalWrap, 'type', (_: Record<string, unknown>[], pain: ReactElement) => {
      // Filter out overlays
      const modals = pain.props.children.filter((x: any) => (!x?.props?.className.includes('ModalOverlay')));
      if (!modals) return pain;

      // Find active modal within children list
      const activeModal = modals.find((x: any) => x ? x[0]?.props.active : false);
      // Closing or no modals
      if (!activeModal) return pain;

      // Only get game properties modal
      const modalComponent = activeModal[0].props.modal.element.props.children;
      console.info(modalComponent);
      if (!(
        Object.prototype.hasOwnProperty.call(modalComponent.props, 'launchSource') &&
        Object.prototype.hasOwnProperty.call(modalComponent.props, 'omitPrimaryAction') &&
        Object.prototype.hasOwnProperty.call(modalComponent.props, 'details')
      )) return pain;

      // Info to pass to /steamgriddb page
      const appType: any = modalComponent.props.overview.app_type; // 1 = steam, >1 = shortcut/mod
      const appId: any = modalComponent.props.overview.appid;
      const gameId: any = modalComponent.props.overview.m_gameid;
      const gameName: any = modalComponent.props.overview.display_name;
      const thirdPartyMod: any = modalComponent.props.overview.third_party_mod;
      const parentAppId: any = modalComponent.props.overview.optional_parent_app_id;

      const appInfo = {
        'appType': appType,
        'appId': appId,
        'gameId': gameId,
        'gameName': gameName,
        'thirdPartyMod': thirdPartyMod,
        'parentAppId': parentAppId
      };
      console.info(appInfo);

      // Finally, add a new button
      wrapReactClass(modalComponent);
      afterPatch(modalComponent.type.prototype, 'render', (_: Record<string, unknown>[], pain2: ReactElement) => {
        console.log('test3', pain2);
        console.info(cloneElement(pain2.props.children[3], () => {console.log('test');}));
        console.info(<MenuItem onSelected={() => { console.log('test'); }}>Change artwork...</MenuItem>);

        // Add button second to last
        pain2.props.children.splice(-1, 0, cloneElement(pain2.props.children[3], {
          children: 'Change artwork...',
          onSelected: () => {
            Router.Navigate(`/steamgriddb/${appId}?${new URLSearchParams(appInfo).toString()}`);
          }
        }));
        return pain2;
      });

      return pain;
    });

    return props;
  });
}