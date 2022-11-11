import {
  MenuItem,
  Router,
  ServerAPI,
  afterPatch,
  wrapReactType,
  wrapReactClass,
  findInReactTree,
} from 'decky-frontend-lib';
import { ReactElement } from 'react';
import log from './utils/log';
import i18n from './utils/i18n';

export default (serverApi: ServerAPI, findModalManager: any) => serverApi.routerHook.addPatch('/library/app/:appid', (props: { path: string; children: ReactElement }) => {
  wrapReactType(findModalManager.type);
  afterPatch(findModalManager, 'type', (_: Record<string, unknown>[], pain: ReactElement) => {
    if (!pain) return pain;
    const modalFR = findInReactTree(pain, (x) => (
      x?.modal &&
      x?.active &&
      x?.modal?.element?.props?.children?.props &&
      Object.prototype.hasOwnProperty.call(x.modal.element.props.children.props, 'launchSource') &&
      Object.prototype.hasOwnProperty.call(x.modal.element.props.children.props, 'omitPrimaryAction') &&
      Object.prototype.hasOwnProperty.call(x.modal.element.props.children.props, 'details')
    ));
      
    if (!modalFR) return pain;
    
    log('a4');
    const modalComponent = modalFR.modal.element.props.children;

    // Finally, add a new button
    wrapReactClass(modalComponent);
    afterPatch(modalComponent.type.prototype, 'render', (_: Record<string, unknown>[], pain2: ReactElement) => {
      if (pain2.props.children.find((x: any) => x?.key && x.key === 'sgdb-change-artwork')) return pain2;

      // Add button second to last
      pain2.props.children.splice(-1, 0, (
        <MenuItem
          key="sgdb-change-artwork"
          onSelected={() => {
            Router.Navigate(`/steamgriddb/${modalComponent.props.overview.appid}}`);
          }}
        >
          {i18n('Change artwork...')}
        </MenuItem>
      ));
      return pain2;
    });

    return pain;
  });

  return props;
});