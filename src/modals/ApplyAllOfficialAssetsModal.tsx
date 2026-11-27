import { FC, useRef, useState } from 'react';
import {
  ModalRoot,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogButton,
  DialogButtonPrimary,
  GamepadButton,
  GamepadEvent,
} from '@decky/ui';
import { toaster } from '@decky/api';

import SteamLang from '../utils/steam-api-language-map';
import { SGDB_ASSET_TYPE_READABLE } from '../constants';
import t from '../utils/i18n';
import MenuIcon from '../components/Icons/MenuIcon';
import focusElementInNavTree from '../utils/focusNav';
import applyOfficialAssets from '../utils/applyOfficialAssets';
import { OfficialAssetSource } from '../utils/officialAssets';

const getAssetLabel = (assetType: SGDBAssetType) => (
  SGDB_ASSET_TYPE_READABLE[assetType]
);

const ApplyAllOfficialAssetsModal: FC<{
  closeModal?: () => void,
  sources: OfficialAssetSource[],
  appName?: string,
  onApply: (url: string, assetType: SGDBAssetType) => Promise<void>,
  onApplied?: () => void,
}> = ({ closeModal, sources, appName, onApply, onApplied }) => {
  const [applying, setApplying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const applyButtonRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLDivElement>(null);

  const handleApplyDirection = (evt: GamepadEvent) => {
    if (applying) return;
    if (evt.detail.button === GamepadButton.DIR_LEFT) {
      focusElementInNavTree(cancelButtonRef.current);
    }
  };

  const handleCancelDirection = (evt: GamepadEvent) => {
    if (applying) return;
    if (evt.detail.button === GamepadButton.DIR_RIGHT) {
      focusElementInNavTree(applyButtonRef.current);
    }
  };

  const hasIcon = sources.some((source) => source.assetType === 'icon');

  const handleApply = async () => {
    if (applying) return;

    setApplying(true);
    const { applied, failed } = await applyOfficialAssets(
      sources,
      onApply,
      (current) => setCurrentIndex(current)
    );

    setApplying(false);
    closeModal?.();
    onApplied?.();

    if (failed.length === 0) {
      toaster.toast({
        title: appName,
        body: t('MSG_APPLY_ALL_OFFICIAL_SUCCESS', 'Applied {count} official assets.').replace('{count}', String(applied.length)),
        icon: <MenuIcon />,
        duration: 2500,
      });
      return;
    }

    if (applied.length > 0) {
      toaster.toast({
        title: appName,
        body: t('MSG_APPLY_ALL_OFFICIAL_PARTIAL', 'Applied {count} of {total} official assets. Failed: {failed}')
          .replace('{count}', String(applied.length))
          .replace('{total}', String(sources.length))
          .replace('{failed}', failed.map(getAssetLabel).join(', ')),
        icon: <MenuIcon fill="#f3171e" />,
        duration: 5000,
      });
      return;
    }

    toaster.toast({
      title: t('MSG_ASSET_APPLY_ERROR', 'There was a problem applying this asset.'),
      body: failed.map(getAssetLabel).join(', '),
      icon: <MenuIcon fill="#f3171e" />,
      duration: 5000,
    });
  };

  const currentSource = sources[currentIndex - 1];

  return (
    <ModalRoot
      className="sgdb-modal sgdb-modal-apply-all-official"
      closeModal={closeModal}
      bDisableBackgroundDismiss={applying}
      bHideCloseIcon={applying}
      bCancelDisabled={applying}
    >
      <DialogHeader>{t('LABEL_APPLY_ALL_OFFICIAL_TITLE', 'Apply All Official Assets?')}</DialogHeader>
      <DialogBody>
        <div className="apply-all-official-desc">
          {t(
            'MSG_APPLY_ALL_OFFICIAL_DESC',
            'This will replace your current artwork for {gameName} with the official Steam assets. Anything you set manually will be overwritten.'
          ).replace('{gameName}', appName ?? '')}
        </div>
        <div className="apply-all-official-list">
          {sources.map((source) => (
            <div
              key={source.assetType}
              className="apply-all-official-card"
            >
              <div className="apply-all-official-thumb">
                <img src={source.getUrl(source.defaultLanguage)} alt="" />
              </div>
              <div className="apply-all-official-name">{getAssetLabel(source.assetType)}</div>
              <div className="apply-all-official-meta">
                {source.assetType === 'icon'
                  ? t('LABEL_OFFICIAL_ICON', 'Steam icon')
                  : SteamLang(source.defaultLanguage, 'api', 'native')}
              </div>
            </div>
          ))}
        </div>
        <div className="apply-all-official-note">
          {applying && currentSource
            ? t('MSG_APPLYING_ALL_OFFICIAL', 'Applying {current} of {total}: {assetType}')
              .replace('{current}', String(currentIndex))
              .replace('{total}', String(sources.length))
              .replace('{assetType}', getAssetLabel(currentSource.assetType))
            : t('MSG_APPLY_ALL_OFFICIAL_ONLY_LISTED', 'Only the assets listed above will be applied.')}
        </div>
        {hasIcon && !applying && (
          <div className="apply-all-official-note icon-warning">
            {t('MSG_APPLY_ALL_OFFICIAL_ICON_WARNING', 'Applying the icon may require restarting Steam.')}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <DialogButton
          ref={cancelButtonRef}
          preferredFocus
          disabled={applying}
          onClick={closeModal}
          onGamepadDirection={handleCancelDirection}
          onOKActionDescription={t('Button_Cancel', 'Cancel', true)}
        >
          {t('Button_Cancel', 'Cancel', true)}
        </DialogButton>
        <DialogButtonPrimary
          ref={applyButtonRef}
          disabled={applying}
          onClick={handleApply}
          onGamepadDirection={handleApplyDirection}
          onOKActionDescription={t('ACTION_APPLY_ALL', 'Apply All')}
        >
          {t('ACTION_APPLY_ALL', 'Apply All')}
        </DialogButtonPrimary>
      </DialogFooter>
    </ModalRoot>
  );
};

export default ApplyAllOfficialAssetsModal;
