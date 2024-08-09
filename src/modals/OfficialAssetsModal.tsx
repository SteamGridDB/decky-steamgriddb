import { FC, useState, useEffect, useMemo, useRef } from 'react';
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

  const handleDownload = async (evt: Event) => {
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

const OfficialAssetsModal: FC<{
  closeModal?: () => void,
  assetType: SGDBAssetType,
  onAssetChange?: (url: string) => Promise<any>,
  data: {
    steam: {
      id: string;
      metadata: {
        clienticon?: string | null;
        header_image: string | null;
        library_capsule: string | null;
        library_hero: string | null;
        library_logo: string | null;
        logo_position: string | null;
        original_release_date: number | null;
        steam_release_date: number | null;
        store_asset_mtime: number | null;
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
      {(assetType === 'grid_l' && meta.header_image) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={meta.header_image.split(',')}
          urlHandler={(newLang) => {
            if (newLang == 'english') {
              return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/header.jpg?t=${meta.store_asset_mtime}`;
            }
            return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/header_${newLang}.jpg?t=${meta.store_asset_mtime}`;
          }}
          urlHandler2x={(newLang) => {
            if (newLang == 'english') {
              return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/header_2x.jpg?t=${meta.store_asset_mtime}`;
            }
            return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/header_${newLang}_2x.jpg?t=${meta.store_asset_mtime}`;
          }}
          langType="api"
          assetProps={{
            width: 460,
            height: 215,
          }}
        />
      )}

      {(assetType === 'grid_p' && meta.library_capsule) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={meta.library_capsule.split(',')}
          urlHandler={(newLang) => {
            if (newLang == 'en') {
              return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/library_600x900_2x.jpg?t=${meta.store_asset_mtime}`;
            }
            return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/library_600x900_${SteamLang(newLang, 'webapi', 'api')}_2x.jpg?t=${meta.store_asset_mtime}`;
          }}
          langType="webapi"
          assetProps={{
            width: 600,
            height: 900,
          }}
        />
      )}

      {(assetType === 'hero' && meta.library_hero) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={meta.library_hero.split(',')}
          urlHandler={(newLang) => {
            if (newLang == 'en') {
              return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/library_hero.jpg?t=${meta.store_asset_mtime}`;
            }
            return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/library_hero_${SteamLang(newLang, 'webapi', 'api')}.jpg?t=${meta.store_asset_mtime}`;
          }}
          urlHandler2x={(newLang) => {
            if (newLang == 'en') {
              return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/library_hero_2x.jpg?t=${meta.store_asset_mtime}`;
            }
            return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/library_hero_${SteamLang(newLang, 'webapi', 'api')}_2x.jpg?t=${meta.store_asset_mtime}`;
          }}
          langType="webapi"
          assetProps={{
            width: 1920,
            height: 620,
          }}
        />
      )}

      {(assetType === 'logo' && meta.library_logo) && (
        <SteamModalImageSection
          closeModal={closeModal}
          onAssetChange={onAssetChange}
          assetType={assetType}
          languages={meta.library_logo.split(',')}
          urlHandler={(newLang) => {
            if (newLang == 'en') {
              return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/logo.png?t=${meta.store_asset_mtime}`;
            }
            return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/logo_${SteamLang(newLang, 'webapi', 'api')}.png?t=${meta.store_asset_mtime}`;
          }}
          urlHandler2x={(newLang) => {
            if (newLang == 'en') {
              return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/logo_2x.png?t=${meta.store_asset_mtime}`;
            }
            return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steam.id}/logo_${SteamLang(newLang, 'webapi', 'api')}_2x.png?t=${meta.store_asset_mtime}`;
          }}
          langType="webapi"
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
