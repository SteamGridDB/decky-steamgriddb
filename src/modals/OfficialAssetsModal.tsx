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

const SteamModalImageSection: FC<{
  closeModal?: () => void,
  languages: string[],
  langType: string,
  urlHandler: (lang: string) => string,
  urlHandler2x?: (lang: string) => string,
  assetType: SGDBAssetType,
  onAssetChange?: (url: string) => Promise<any>,
  assetProps?: Partial<AssetProps>,
}> = ({ closeModal, languages, langType, urlHandler, urlHandler2x, assetType, onAssetChange, assetProps }) => {
  const hasEng = useMemo(() => (languages.indexOf(SteamLang('en', 'webapi', langType) as string) > -1), [langType, languages]);
  const [selectedLang, setSelectedLang] = useState<string>(hasEng ? SteamLang('en', 'webapi', langType) as string : languages[0]); // English as default
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
    if (urlHandler && !fallbackAttempted.current) {
      setSelectedImg(urlHandler(selectedLang));
      fallbackAttempted.current = true;
    }
  };

  // Reset fallback check when changing langs
  useEffect(() => {
    fallbackAttempted.current = false;
  }, [selectedLang]);

  useEffect(() => {
    if (urlHandler2x) {
      setSelectedImg(urlHandler2x(selectedLang));
    } else {
      setSelectedImg(urlHandler(selectedLang));
    }
  }, [selectedLang, urlHandler, urlHandler2x]);

  return (
    <>
      <DialogBody>
        {(languages.length > 1) && (
          <Field label={t('LanguageTitle', 'Language', true)}>
            <Dropdown
              rgOptions={languages.map((language) => ({
                data: language,
                label: SteamLang(language, langType, 'native'),
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
                  onClick={handleDownload}
                  {...assetProps}
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

type FullAssetImages = {
	image: { [language: string]: string };
	image2x: { [language: string]: string };
};

type FullHeaderImages = {
	[languageCode: string]: string;
};

const OfficialAssetsModal: FC<{
  closeModal?: () => void,
  assetType: SGDBAssetType,
  onAssetChange?: (url: string) => Promise<any>,
  data: {
    steam: {
      id: string;
      metadata: {
        store_asset_mtime: number | null;
        library_capsule: string | null;
        library_logo: string | null;
        library_hero: string | null;
        steam_release_date: number | null;
        original_release_date: number | null;
        logo_position: string | null;
        header_image: string | null;
        clienticon: string | null;
        icon: string | null;
        header_image_full: FullHeaderImages;
        library_capsule_full: FullAssetImages;
        library_hero_full: FullAssetImages;
        library_logo_full: FullAssetImages;
      },
    }[],
  }
}> = ({ closeModal, assetType, data, onAssetChange }) => {
  const steam = data.steam[0];
  const meta = steam.metadata;

  return (
    <ModalRoot
      className="sgdb-modal sgdb-modal-official-assets"
      closeModal={closeModal}
      bDisableBackgroundDismiss={false}
      bHideCloseIcon={false}
    >
      {(assetType === 'grid_l' && meta.header_image_full) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={Object.keys(meta.header_image_full)}
          urlHandler2x={(lang) => {
            const fileName = meta.header_image_full[lang].replace(/\.jpg$/, '_2x.jpg');
            return `https://shared.steamstatic.com/store_item_assets/steam/apps/${steam.id}/${fileName}?t=${meta.store_asset_mtime}`;
          }}
          urlHandler={(lang) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${steam.id}/${meta.header_image_full[lang]}?t=${meta.store_asset_mtime}`}
          langType="api"
          assetProps={{
            width: 460,
            height: 215,
          }}
        />
      )}

      {(assetType === 'grid_p' && meta.library_capsule_full) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={Object.keys(meta.library_capsule_full.image)}
          urlHandler2x={meta.library_capsule_full?.image2x ? (lang) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${steam.id}/${meta.library_capsule_full.image2x[lang]}?t=${meta.store_asset_mtime}` : undefined}
          urlHandler={(lang) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${steam.id}/${meta.library_capsule_full.image[lang]}?t=${meta.store_asset_mtime}`}
          langType="api"
          assetProps={{
            width: 600,
            height: 900,
          }}
        />
      )}

      {(assetType === 'hero' && meta.library_hero_full) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={Object.keys(meta.library_hero_full.image)}
          urlHandler2x={meta.library_hero_full?.image2x ? (lang) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${steam.id}/${meta.library_hero_full.image2x[lang]}?t=${meta.store_asset_mtime}` : undefined}
          urlHandler={(lang) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${steam.id}/${meta.library_hero_full.image[lang]}?t=${meta.store_asset_mtime}`}
          langType="api"
          assetProps={{
            width: 1920,
            height: 620,
          }}
        />
      )}

      {(assetType === 'logo' && meta.library_logo_full) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={Object.keys(meta.library_logo_full.image)}
          urlHandler2x={meta.library_logo_full?.image2x ? (lang) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${steam.id}/${meta.library_logo_full.image2x[lang]}?t=${meta.store_asset_mtime}` : undefined}
          urlHandler={(lang) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${steam.id}/${meta.library_logo_full.image[lang]}?t=${meta.store_asset_mtime}`}
          langType="api"
        />
      )}

      {(assetType === 'icon' && meta.clienticon) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={['English']}
          urlHandler={() => `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${steam.id}/${meta.clienticon}.ico`}
          langType="english"
          assetProps={{
            width: 32,
            height: 32,
          }}
        />
      )}
    </ModalRoot>
  );
};

export default OfficialAssetsModal;
