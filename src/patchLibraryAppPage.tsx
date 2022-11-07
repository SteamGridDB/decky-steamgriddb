import {
  MenuItem,
  Router,
  ServerAPI,
  afterPatch,
  wrapReactType,
  wrapReactClass,
  findInReactTree,
  ModalRoot,
  findModule,
  wrapReactClass,
  getReactInstance
} from 'decky-frontend-lib';
import { ReactElement } from 'react';

export default (serverApi: ServerAPI) => serverApi.routerHook.addPatch('/library/app/:appid', (props: { path: string; children: ReactElement }) => {
  // @ts-ignore
  const reactRoot = document.getElementById('root')._reactRootContainer._internalRoot.current;
  const findModalManager = findInReactTree(reactRoot, (x) => x.pendingProps?.DialogWrapper && x.pendingProps?.ModalManager);

  wrapReactType(findModalManager.type);
  afterPatch(findModalManager, 'type', (_: Record<string, unknown>[], pain: ReactElement) => {
    console.log('a4');
    // Filter out overlays
    const modals = pain?.props?.children.filter((x: any) => (!x?.props?.className.includes('ModalOverlay')));
    if (!modals) {
      return pain;
    }

    // Find active modal within children list
    const activeModal = modals.find((x: any) => x ? x[0]?.props.active : false);
    // Closing or no modals
    if (!activeModal) {
      return pain;
    }

    // Only get game properties modal
    const modalComponent = activeModal[0].props.modal.element.props.children;
    if (!(
      Object.prototype.hasOwnProperty.call(modalComponent.props, 'launchSource') &&
      Object.prototype.hasOwnProperty.call(modalComponent.props, 'omitPrimaryAction') &&
      Object.prototype.hasOwnProperty.call(modalComponent.props, 'details')
    )) {
      return pain;
    }

    // Info to pass to /steamgriddb page
    const appInfo: SGDBPageAppDetails = {
      'appType': modalComponent.props.overview.app_type,
      'appId': modalComponent.props.overview.appid,
      'gameId': modalComponent.props.overview.m_gameid,
      'gameName': modalComponent.props.overview.display_name,
      'thirdPartyMod': modalComponent.props.overview.third_party_mod,
      'parentAppId': modalComponent.props.overview.optional_parent_app_id
    };
  
    // Finally, add a new button
    wrapReactClass(modalComponent);
    let cache2: any = null;
    afterPatch(modalComponent.type.prototype, 'render', (_: Record<string, unknown>[], pain2: ReactElement) => {
      if (cache2) {
        pain2.props.children = cache2;
      } else {
        if (pain2.props.children.find((x: any) => x?.props?.key === 'sgdb-change-artwork')) return pain2;
        wrapReactType(pain2.props.children);
  
        // Add button second to last
        pain2.props.children.splice(-1, 0, (
          <MenuItem
            key="sgdb-change-artwork"
            onSelected={() => {
              // this is bad but i can't send query strings ¯\_(ツ)_/¯
              Router.Navigate(`/steamgriddb/${appInfo.appId}/${encodeURIComponent(window.btoa(JSON.stringify(appInfo)))}`);
            }}
          >
            Change artwork...
          </MenuItem>
        ));
        cache2 = pain2.props.children;
      }
      return pain2;
    });

    return pain;
  });

  return props;
});