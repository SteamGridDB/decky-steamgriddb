import {
  PanelSectionRow,
  DialogButton,
  Field,
  Focusable,
  Router,
} from 'decky-frontend-lib';
import { FC, ReactNode } from 'react';
import { HiQrCode } from 'react-icons/hi2';
import showQrModal from '../utils/showQrModal';
import t from '../utils/i18n';

const navLink = (url: string) => {
  Router.CloseSideMenus();
  Router.NavigateToExternalWeb(url);
};

/**
 * Panel row with a button next to an icon.
 */
const PanelSocialButton: FC<{
  icon: ReactNode;
  url: string;
}> = ({ icon, children, url }) => (
  <PanelSectionRow>
    <Field
      bottomSeparator="none"
      icon={null}
      label={null}
      childrenLayout={undefined}
      inlineWrap="keep-inline"
      padding="none"
      spacingBetweenLabelAndChild="none"
      childrenContainerWidth="max"
    >
      <Focusable style={{ display: 'flex' }}>
        <div
          style={{
            display: 'flex',
            fontSize: '1.5em',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: '.5em',
          }}
        >
          {icon}
        </div>
        <DialogButton
          onClick={() => navLink(url)}
          onSecondaryButton={() => showQrModal(url)}
          onSecondaryActionDescription={t('ACTION_SHOW_LINK_QR', 'Show Link QR')}
          style={{
            padding: '10px',
            fontSize: '14px',
          }}
        >
          {children}
        </DialogButton>
        <DialogButton
          onOKActionDescription={t('ACTION_SHOW_LINK_QR', 'Show Link QR')}
          onClick={() => showQrModal(url)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px',
            maxWidth: '40px',
            minWidth: 'auto',
            marginLeft: '.5em'
          }}
        >
          <HiQrCode />
        </DialogButton>
      </Focusable>
    </Field>
  </PanelSectionRow>
);

export default PanelSocialButton;