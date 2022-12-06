import { FC, useState, useEffect, useRef } from 'react';
import { Focusable, joinClassNames, SteamAppOverview } from 'decky-frontend-lib';
import { HiTrash, HiFolder, HiEyeSlash } from 'react-icons/hi2';
import useSGDB from './hooks/useSGDB';
import t from './utils/i18n';

import LibraryImage from './components/LibraryImage';
import getAppOverview from './utils/getAppOverview';

/*
  Don't match hidden files and only match directories and specific file extensions.
  Credit goes to SirMangler for this beast.

  Tests: https://regex101.com/r/2EeIqZ/1
*/
const imagesExpr = /(?<!.)(.*)\.(jpe?g|a?png|webp|gif)$|(?<!.)([^.]|.*\\)+(?!.)/gi;

const AssetBlock: FC<{
  app: SteamAppOverview & {
    appid: number,
  },
  label: string,
  eAssetType: eAssetType,
  browseStartPath: string,
}> = ({ app, label, browseStartPath, eAssetType }) => {
  const { clearAsset, changeAsset, serverApi, changeAssetFromUrl } = useSGDB();
  const [overview, setOverview] = useState<SteamAppOverview | null>(app);
  const innerFocusRef = useRef<HTMLDivElement>(null);

  const refreshOverview = async () => {
    setOverview(await getAppOverview(app.appid));
  };

  const handleBrowse = async () => {
    const path = await serverApi.openFilePicker(browseStartPath, true, imagesExpr);
    await changeAssetFromUrl(path.path as string, eAssetType, true);
    await refreshOverview();
  };

  const handleBlank = async () => {
    await changeAsset('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=', eAssetType);
    await refreshOverview();
  };

  const handleClear = async () => {
    await clearAsset(eAssetType);
    setTimeout(async () => {
      await refreshOverview();
    }, 500);
  };

  return <div className={joinClassNames('asset-wrap', `asset-type-${eAssetType}`)}>
    <div className="asset-label">{label}</div>
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
        eAssetType={eAssetType}
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
      <AssetBlock app={overview} eAssetType={0} browseStartPath={startPath} label={t('LABEL_CAPSULE_CURRENT', 'Current Capsule')} />
      <AssetBlock app={overview} eAssetType={4} browseStartPath={startPath} label={t('LABEL_ICON_CURRENT', 'Current Icon')} />
    </Focusable>
    <Focusable flow-children="right" style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <AssetBlock app={overview} eAssetType={3} browseStartPath={startPath} label={t('LABEL_WIDECAPSULE_CURRENT', 'Current Wide Capsule')} />
      <AssetBlock app={overview} eAssetType={2} browseStartPath={startPath} label={t('LABEL_LOGO_CURRENT', 'Current Logo')} />
    </Focusable>
    <div style={{ gridColumn: 'span 2' }}>
      <AssetBlock app={overview} eAssetType={1} browseStartPath={startPath} label={t('LABEL_HERO_CURRENT', 'Current Hero')} />
    </div>
  </Focusable>;
};

export default LocalTab;
