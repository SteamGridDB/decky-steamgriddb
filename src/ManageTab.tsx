import { FC, useState, useEffect, useRef } from 'react';
import { Focusable, joinClassNames, SteamAppOverview } from 'decky-frontend-lib';
import { HiTrash, HiFolder, HiEyeSlash } from 'react-icons/hi2';
import useSGDB from './hooks/useSGDB';
import t from './utils/i18n';

import LibraryImage from './components/LibraryImage';
import getAppOverview from './utils/getAppOverview';
import { ASSET_TYPE, SGDB_ASSET_TYPE_READABLE } from './constants';

/*
  Don't match hidden files and only match directories and specific file extensions.
  Credit goes to SirMangler for this beast.

  Tests: https://regex101.com/r/2EeIqZ/1
*/
const imagesExpr = /(?<!.)(.*)\.(jpe?g|a?png|webp|gif)$|(?<!.)([^.]|.*\\)+(?!.)/gi;

const AssetBlock: FC<{
  app: SteamAppOverview,
  assetType: SGDBAssetType,
  browseStartPath: string,
}> = ({ app, browseStartPath, assetType }) => {
  const { clearAsset, changeAsset, serverApi, changeAssetFromUrl } = useSGDB();
  const [overview, setOverview] = useState<SteamAppOverview | null>(app);
  const innerFocusRef = useRef<HTMLDivElement>(null);

  const refreshOverview = async () => {
    setOverview(await getAppOverview(app.appid));
  };

  const handleBrowse = async () => {
    const path = await serverApi.openFilePicker(browseStartPath, true, imagesExpr);
    await changeAssetFromUrl(path.path as string, assetType, true);
    await refreshOverview();
  };

  const handleBlank = async () => {
    await changeAsset('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=', assetType);
    await refreshOverview();
  };

  const handleClear = async () => {
    await clearAsset(assetType);
  };

  return <div className={joinClassNames('asset-wrap', `asset-wrap-${assetType}`)}>
    <div className="asset-label">{t('LABEL_ASSET_CURRENT', 'Current {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}</div>
    <Focusable
      onActivate={() => innerFocusRef.current?.focus()}
      focusWithinClassName="is-focused"
      focusClassName="is-focused"
    >
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
        <Focusable
          noFocusRing
          className="action-button"
          onActivate={handleBlank}
          onOKActionDescription={t('ACTION_ASSET_APPLY_TRANSPARENT', 'Use Invisible Asset')}
        >
          <HiEyeSlash />
        </Focusable>
      </Focusable>
      {overview && <LibraryImage
        app={overview}
        eAssetType={ASSET_TYPE[assetType]}
        allowCustomization={false}
        className="asset"
        imageClassName="asset-img"
      />}
    </Focusable>
  </div>;
};

const LocalTab: FC = () => {
  const { appId, serverApi, appOverview } = useSGDB();
  const [startPath, setStartPath] = useState('/');
  const [overview, setOverview] = useState<any>();

  useEffect(() => {
    if (!appId) return;
    (async () => {
      setOverview(await getAppOverview(appId));
      const path = (await serverApi.callPluginMethod('get_local_start', {})).result as string;
      setStartPath(path);
    })();
  }, [appId, appOverview, serverApi]);

  if (!overview || !appId) return null;

  return <Focusable id="local-images-container">
    <Focusable flow-children="right" style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <AssetBlock
        app={overview}
        assetType="grid_p"
        browseStartPath={startPath}
      />
      <AssetBlock
        app={overview}
        assetType="icon"
        browseStartPath={startPath}
      />
    </Focusable>
    <Focusable flow-children="right" style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <AssetBlock
        app={overview}
        assetType="grid_l"
        browseStartPath={startPath}
      />
      <AssetBlock
        app={overview}
        assetType="logo"
        browseStartPath={startPath}
      />
    </Focusable>
    <div style={{ gridColumn: 'span 2' }}>
      <AssetBlock
        app={overview}
        assetType="hero"
        browseStartPath={startPath}
      />
    </div>
  </Focusable>;
};

export default LocalTab;
