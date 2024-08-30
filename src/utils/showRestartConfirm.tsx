import { showModal, ConfirmModal } from 'decky-frontend-lib';

import t from './i18n';

const restartSteam = () => {
  SteamClient.User.StartRestart(false);
};

const showRestartConfirm = () => {
  showModal(
    <ConfirmModal
      strTitle={t('LABEL_RESTART_STEAM_TITLE', 'Restart Steam?')}
      strCancelButtonText={t('ACTION_RESTART_STEAM_LATER', 'Later')}
      strOKButtonText={t('ACTION_RESTART_STEAM_NOW', 'Restart Now')}
      strDescription={t('MSG_RESTART_STEAM_DESC', 'Steam needs to be restarted for the changes to take effect.')}
      onOK={restartSteam}
    />
  );
};

export default showRestartConfirm;