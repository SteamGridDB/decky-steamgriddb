import {
  PanelSectionRow,
  DialogButton,
  Field,
  Focusable,
  showModal,
  ModalRoot,
  Router,
} from 'decky-frontend-lib';
import { FC, ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { HiQrCode } from 'react-icons/hi2';

const navLink = (url: string) => {
  Router.CloseSideMenus();
  Router.NavigateToExternalWeb(url);
};

const openQR = (url: string) => {
  showModal(
    <ModalRoot>
      <QRCodeSVG
        style={{ margin: '0 auto' }}
        value={url}
        includeMargin
        size={256}
      />
      <p style={{ textAlign: 'center' }}>{url}</p>
    </ModalRoot>,
    window
  );
};

/**
 * Panel row with a button next to an icon.
 */
const PanelSocialButton: FC<{
  icon: ReactNode;
  qr?: boolean;
  url: string;
}> = ({ icon, children, qr = false, url }) => (
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
          style={{
            padding: '10px',
            fontSize: '14px',
          }}
        >
          {children}
        </DialogButton>
        {qr && <DialogButton
          onClick={() => openQR(url)}
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
        </DialogButton>}
      </Focusable>
    </Field>
  </PanelSectionRow>
);

export default PanelSocialButton;