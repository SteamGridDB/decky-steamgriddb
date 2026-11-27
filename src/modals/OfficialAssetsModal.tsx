import {
  FC,
  useState,
  useEffect,
  useMemo,
  useRef,
  MouseEvent,
} from 'react';
import {
  ModalRoot,
  DialogButtonPrimary,
  Field,
  DialogBody,
  DialogControlsSection,
  Dropdown,
  DialogFooter,
  joinClassNames,
} from '@decky/ui';

import SteamLang from '../utils/steam-api-language-map';
import { SGDB_ASSET_TYPE_READABLE } from '../constants';
import t from '../utils/i18n';
import Asset, { AssetProps } from '../components/asset/Asset';
import { getOfficialAssetSource, OfficialAssetSource, SteamExternalData } from '../utils/officialAssets';

const assetPropsByType: Partial<Record<SGDBAssetType, Partial<AssetProps>>> = {
  grid_l: {
    width: 460,
    height: 215,
  },
  grid_p: {
    width: 600,
    height: 900,
  },
  hero: {
    width: 1920,
    height: 620,
  },
  icon: {
    width: 32,
    height: 32,
  },
};

const SteamModalImageSection: FC<{
  closeModal?: () => void,
  source: OfficialAssetSource,
  onAssetChange?: (url: string) => Promise<any>,
}> = ({ closeModal, source, onAssetChange }) => {
  const { assetType, languages, defaultLanguage } = source;
  const [selectedLang, setSelectedLang] = useState<string>(defaultLanguage);
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const fallbackAttempted = useRef(false);

  const handleDownload = async (evt: Event | MouseEvent) => {
    evt.preventDefault();
    setDownloading(true);
    await onAssetChange?.(selectedImg);
    setDownloading(false);
    closeModal?.();
  };

  const handleImgError = () => {
    if (!fallbackAttempted.current) {
      setSelectedImg(source.getUrl(selectedLang));
      fallbackAttempted.current = true;
    }
  };

  // Reset fallback check when changing langs
  useEffect(() => {
    fallbackAttempted.current = false;
  }, [selectedLang]);

  useEffect(() => {
    setSelectedImg(source.getUrl2x?.(selectedLang) ?? source.getUrl(selectedLang));
  }, [selectedLang, source]);

  return (
    <>
      <DialogBody>
        {(languages.length > 1) && (
          <Field label={t('LanguageTitle', 'Language', true)}>
            <Dropdown
              rgOptions={languages.map((language) => ({
                data: language,
                label: SteamLang(language, 'api', 'native'),
              }))}
              selectedOption={selectedLang}
              onChange={(newLang) => setSelectedLang(newLang.data)}
            />
          </Field>
        )}
        <DialogControlsSection>
          {selectedImg && (
            <Field
              padding="none"
              childrenLayout="below"
              childrenContainerWidth="max"
              bottomSeparator="none"
            >
              <div className={joinClassNames('official-steam-asset', assetType)}>
                <Asset
                  src={selectedImg}
                  width={0}
                  height={0}
                  assetType={assetType}
                  isAnimated={false}
                  isDownloading={downloading}
                  onImgError={handleImgError}
                  onClick={() => {}}
                  onActivate={() => {}}
                  {...assetPropsByType[assetType]}
                />
              </div>
            </Field>
          )}
        </DialogControlsSection>
      </DialogBody>
      <DialogFooter>
        <DialogButtonPrimary
          onClick={handleDownload}
          onOKActionDescription={t('ACTION_ASSET_APPLY', 'Apply {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}
        >
          {t('ACTION_ASSET_APPLY', 'Apply {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}
        </DialogButtonPrimary>
      </DialogFooter>
    </>
  );
};

const OfficialAssetsModal: FC<{
  closeModal?: () => void,
  assetType: SGDBAssetType,
  onAssetChange?: (url: string) => Promise<any>,
  data: SteamExternalData,
}> = ({ closeModal, assetType, data, onAssetChange }) => {
  const source = useMemo(
    () => getOfficialAssetSource(data, assetType),
    [data, assetType]
  );

  if (!source) return null;

  return (
    <ModalRoot
      className="sgdb-modal sgdb-modal-official-assets"
      closeModal={closeModal}
      bDisableBackgroundDismiss={false}
      bHideCloseIcon={false}
    >
      <SteamModalImageSection
        closeModal={closeModal}
        onAssetChange={onAssetChange}
        source={source}
      />
    </ModalRoot>
  );
};

export default OfficialAssetsModal;
