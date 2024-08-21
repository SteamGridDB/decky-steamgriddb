import {
  ModalRoot,
  DialogHeader,
  DialogBody,
  Navigation,
  DialogButton,
  DialogFooter,
  ControlsList,
} from 'decky-frontend-lib';
import { FC } from 'react';
import { SiPatreon, SiKofi } from 'react-icons/si';

import t from '../utils/i18n';

const BeggingModal: FC<{ closeModal?: () => void }> = ({ closeModal }) => {
  return (
    <ModalRoot
      className="sgdb-modal sgdb-modal-begging"
      closeModal={closeModal}
      bDisableBackgroundDismiss={false}
      bHideCloseIcon={false}
    >
      <DialogHeader>{t('LABEL_BEGGING_MODAL_TITLE', 'Thank you for using SteamGridDB!')}</DialogHeader>
      <DialogBody>
        <div>
          {t('LABEL_BEGGING_MODAL_DESC', 'Please consider donating to help with maintenance and server costs!')}
        </div>
      </DialogBody>
      <DialogFooter>
        <ControlsList>
          <DialogButton onClick={closeModal} style={{ height: '100%' }}>
            {t('Button_Close', 'Close', true)}
          </DialogButton>
          <DialogButton
            onClick={() => {
              Navigation.NavigateToExternalWeb('https://www.patreon.com/steamgriddb');
              closeModal?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5em',
            }}
          >
            <SiPatreon size="1em" /> Patreon
          </DialogButton>
          <DialogButton
            onClick={() => {
              Navigation.NavigateToExternalWeb('https://ko-fi.com/steamgriddb');
              closeModal?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5em',
            }}
          >
            <SiKofi size="1em" /> Ko-fi
          </DialogButton>
        </ControlsList>
      </DialogFooter>
    </ModalRoot>
  );
};

export default BeggingModal;
