import { showModal, ModalRoot } from '@decky/ui';
import { QRCodeSVG } from 'qrcode.react';

const showQrModal = (url: string) => {
  showModal(
    <ModalRoot>
      <QRCodeSVG
        style={{ margin: '0 auto 1.5em auto' }}
        value={url}
        includeMargin
        size={256}
      />
      <span style={{ textAlign: 'center', wordBreak: 'break-word' }}>{url}</span>
    </ModalRoot>,
    window
  );
};

export default showQrModal;