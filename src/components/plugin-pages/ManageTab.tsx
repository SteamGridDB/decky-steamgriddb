import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { call } from '@decky/api';
import {
  DialogButton,
  Focusable,
  joinClassNames,
  showModal,
} from '@decky/ui';
import { HiTrash, HiFolder, HiEyeSlash } from 'react-icons/hi2';

import useSGDB from '../../hooks/useSGDB';
import t from '../../utils/i18n';
import LibraryImage from '../asset/LibraryImage';
import getAppOverview from '../../utils/getAppOverview';
import { ASSET_TYPE, SGDB_ASSET_TYPE_READABLE } from '../../constants';
import openFilePicker from '../../utils/openFilePicker';
import LogoPositionerModal from '../../modals/LogoPositionerModal';
import canEditSteamIcon from '../../utils/canEditSteamIcon';

const AssetBlock: FC<{
  app: AppStoreAppOverview,
  assetType: SGDBAssetType,
  browseStartPath: string,
  refreshKey?: number,
  onRefresh: () => Promise<AppStoreAppOverview | undefined>,
  editable?: boolean,
}> = ({ app, browseStartPath, assetType, refreshKey = 0, onRefresh, editable = true }) => {
  const { clearAsset, changeAsset, changeAssetFromUrl } = useSGDB();
  const [overview, setOverview] = useState<AppStoreAppOverview | null>(app);
  const innerFocusRef = useRef<HTMLDivElement>(null);
  const refreshing = useRef(false);

  const refreshOverview = async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    setOverview(null);

    try {
      const appoverview = await onRefresh();
      setOverview(appoverview ?? app);
    } finally {
      refreshing.current = false;
    }
  };

  const isShortcutIcon = assetType === 'icon' && app.BIsShortcut();
  const [isShortcutIconLoaded] = useState(() => Boolean(app.icon_data));

  // Steam reads shortcut icon into icon_data as a result of this first render,
  // so check again to pick up what just landed
  useEffect(() => {
    if (isShortcutIcon && !isShortcutIconLoaded) refreshOverview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShortcutIcon, isShortcutIconLoaded]);

  useEffect(() => {
    if (!refreshKey) return;
    refreshOverview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleBrowse = async () => {
    const path = await openFilePicker(browseStartPath, true, undefined, {
      validFileExtensions: ['png','jpg','jpeg','gif','webp','apng','tiff','tga'],
    });
    await changeAssetFromUrl(path.path as string, assetType, true);
    await refreshOverview();
  };

  const handleBlank = async () => {
    await changeAsset('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=', assetType);
    await refreshOverview();
  };

  const handleClear = async () => {
    await clearAsset(assetType);
    await refreshOverview();
  };

  return (
    <div className={joinClassNames('asset-wrap', `asset-wrap-${assetType}`)}>
      <div className="asset-label">{t('LABEL_ASSET_CURRENT', 'Current {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}</div>
      <Focusable
        onActivate={editable ? () => innerFocusRef.current?.focus() : undefined}
        onClick={(evt) => evt.preventDefault()} // Click events only happen with cursor, don't need to focus if clicking.
        focusWithinClassName="is-focused"
        focusClassName="is-focused"
      >
        {editable && (
          <Focusable flow-children="right" className="action-overlay">
            <Focusable
              ref={innerFocusRef}
              noFocusRing
              className="action-button"
              onActivate={handleClear}
              onOKActionDescription={t('ACTION_ASSET_CUSTOM_CLEAR', 'Clear Custom Asset')}
            >
              <HiTrash />
            </Focusable>
            <Focusable
              noFocusRing
              className="action-button"
              onActivate={handleBrowse}
              onOKActionDescription={t('ACTION_ASSET_BROWSE_LOCAL', 'Browse for Local Files')}
            >
              <HiFolder />
            </Focusable>
            {assetType !== 'icon' && (
              <Focusable
                noFocusRing
                className="action-button"
                onActivate={handleBlank}
                onOKActionDescription={t('ACTION_ASSET_APPLY_TRANSPARENT', 'Use Invisible Asset')}
              >
                <HiEyeSlash />
              </Focusable>
            )}
          </Focusable>
        )}
        {overview ? (
          <LibraryImage
            app={overview}
            eAssetType={ASSET_TYPE[assetType]}
            allowCustomization={false}
            className="asset"
            imageClassName="asset-img"
          />
        ) : (
          <div className="asset" />
        )}
      </Focusable>
    </div>
  );
};

const LocalTab: FC<{ refreshKey?: number }> = ({ refreshKey = 0 }) => {
  const { appId, appOverview } = useSGDB();
  const [startPath, setStartPath] = useState('/');
  const [overview, setOverview] = useState<AppStoreAppOverview>();
  const refreshPromise = useRef<Promise<AppStoreAppOverview | undefined> | null>(null);

  useEffect(() => {
    if (!appId) return;
    (async () => {
      const appoverview = await getAppOverview(appId);
      if (!appoverview) return;

      if (appoverview.icon_hash) {
        // bump the icon url's cache buster so it gets read from disk again
        appoverview.local_cache_version = Date.now();
      }

      setOverview(appoverview);
      const path = await call('get_local_start') as string;
      setStartPath(path);
    })();
  }, [appId, appOverview]);

  // All five AssetBlocks share one refresh so applying all official assets only
  // fetches the updated overview once.
  const refreshOverview = useCallback(async () => {
    if (!appId) return undefined;

    if (!refreshPromise.current) {
      refreshPromise.current = (async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const appoverview = await getAppOverview(appId);

        if (appoverview?.icon_hash) {
          // bump the icon url's cache buster so it gets read from disk again
          appoverview.local_cache_version = Date.now();
        }

        return appoverview ?? undefined;
      })().finally(() => {
        refreshPromise.current = null;
      });
    }

    return refreshPromise.current;
  }, [appId]);

  const canEditIcon = canEditSteamIcon(overview);

  if (!overview || !appId) return null;

  return (
    <Focusable id="local-images-container">
      <Focusable flow-children="right" style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
        <AssetBlock
          app={overview}
          assetType="grid_p"
          browseStartPath={startPath}
          refreshKey={refreshKey}
          onRefresh={refreshOverview}
        />
        <AssetBlock
          app={overview}
          assetType="icon"
          browseStartPath={startPath}
          refreshKey={refreshKey}
          onRefresh={refreshOverview}
          editable={canEditIcon}
        />
      </Focusable>
      <Focusable flow-children="right" style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
        <AssetBlock
          app={overview}
          assetType="grid_l"
          browseStartPath={startPath}
          refreshKey={refreshKey}
          onRefresh={refreshOverview}
        />
        <AssetBlock
          app={overview}
          assetType="logo"
          browseStartPath={startPath}
          refreshKey={refreshKey}
          onRefresh={refreshOverview}
        />
      </Focusable>
      <div style={{ gridColumn: 'span 2' }}>
        <AssetBlock
          app={overview}
          assetType="hero"
          browseStartPath={startPath}
          refreshKey={refreshKey}
          onRefresh={refreshOverview}
        />
      </div>
      <Focusable flow-children="right" style={{ gridColumn: 'span 2', display: 'flex', gap: '.5em' }}>
        <DialogButton
          onClick={() => {
            showModal(<LogoPositionerModal appId={appId} />, window);
          }}
        >
          {t('CustomArt_EditLogoPosition', 'Adjust Logo Position', true)}
        </DialogButton>
        <DialogButton
          onClick={async () => {
            await (window.appDetailsStore as unknown as {
              ClearCustomLogoPosition: (app: AppStoreAppOverview) => any;
            }).ClearCustomLogoPosition(overview);
          }}
        >
          {t('CustomArt_ResetLogoPosition', 'Reset Logo Position', true)}
        </DialogButton>
      </Focusable>
    </Focusable>
  );
};

export default LocalTab;
