import { ModalRoot, DialogButtonPrimary, joinClassNames, Focusable, Navigation } from '@decky/ui';
import { FC, MouseEvent, useState } from 'react';

import Asset, { AssetProps } from '../components/asset/Asset';
import Markdown from '../components/Markdown';
import t from '../utils/i18n';
import { SGDB_ASSET_TYPE_READABLE, SGDB_MIME_MAP } from '../constants';

const DetailsModal: FC<{
  closeModal?: () => void,
  asset: any,
  assetType: SGDBAssetType,
  onAssetChange?: () => Promise<any>,
  assetProps?: Partial<AssetProps>
}> = ({ closeModal, asset, assetType, onAssetChange, assetProps }) => {
  const [downloading, setDownloading] = useState(false); // props don't update in modals, need to repeat this here

  const handleDownload = async (evt: Event | MouseEvent) => {
    evt.preventDefault();
    setDownloading(true);
    await onAssetChange?.();
    setDownloading(false);
  };

  return (
    <ModalRoot
      className="sgdb-modal sgdb-modal-details"
      closeModal={closeModal}
      bDisableBackgroundDismiss={false}
      bHideCloseIcon={false}
    >
      <div className={joinClassNames('sgdb-modal-details-wrapper', asset.width > asset.height ? 'wide' : '')}>
        <Asset
          src={asset.url}
          width={asset.width}
          height={asset.height}
          assetType={assetType}
          isAnimated={false}
          isDownloading={downloading}
          onClick={handleDownload}
          {...assetProps}
        />
        <div className="info">
          <DialogButtonPrimary
            onClick={handleDownload}
            onOKActionDescription={t('ACTION_ASSET_APPLY', 'Apply {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}
          >
            {t('ACTION_ASSET_APPLY', 'Apply {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}
          </DialogButtonPrimary>
          <span className="meta">
            {[
              SGDB_MIME_MAP[asset.mime] || asset.mime,
              asset.style.replace(/_/g, ' '),
              asset.width > 0 ? `${asset.width}×${asset.height}` : undefined,
            ].filter(Boolean).join(' • ')}
          </span>
          <Focusable className="author" onActivate={() => {
            Navigation.NavigateToExternalWeb(`https://steamcommunity.com/profiles/${asset.author.steam64}`);
            closeModal?.();
          }}
          >
            <img src={asset.author.avatar} alt="" />
            <span>{asset.author.name}</span>
          </Focusable>
          {asset.notes && (
            <Markdown
              onLinkClick={closeModal}
              focusableProps={{ className: 'notes' }}
            >
              {asset.notes}
            </Markdown>
          )}
        </div>
      </div>
    </ModalRoot>
  );
};

export default DetailsModal;
