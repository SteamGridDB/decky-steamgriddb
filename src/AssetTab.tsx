import {
  Focusable,
  joinClassNames,
  showModal,
} from 'decky-frontend-lib';
import { useState, VFC, useRef, useEffect } from 'react';
import { useSGDB } from './hooks/useSGDB';
import Asset from './components/Asset';
import t from './utils/i18n';
import log from './utils/log';
import Toolbar, { ToolbarRefType } from './components/Toolbar';
import MenuIcon from './components/MenuIcon';
import DetailsModal from './Modals/DetailsModal';
import { SGDB_ASSET_TYPE_READABLE } from './constants';
import useAssetSearch from './hooks/useAssetSearch';

const AssetTab: VFC<{ assetType: SGDBAssetType }> = ({ assetType }) => {
  const { loading, assets, doSearchAndSetAssets, openFilters } = useAssetSearch();
  const { isSearchReady, appDetails, changeAssetFromUrl, serverApi } = useSGDB();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [sizingStyles, setSizingStyles] = useState<any>(undefined);

  const toolbarRef = useRef<ToolbarRefType>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const setAsset = async (assetId: number, url: string) => {
    log('cliccc');
    if (!downloadingId) {
      try {
        setDownloadingId(assetId);
        await changeAssetFromUrl(url, assetType);
        serverApi.toaster.toast({
          title: appDetails?.strDisplayName,
          body: t('{assetType} has been successfully applied!').replace('{assetType}', t(SGDB_ASSET_TYPE_READABLE[assetType])),
          icon: <MenuIcon />,
        });
      } catch (err: any) {
        serverApi.toaster.toast({
          title: t('Error applying asset.'),
          body: err.message,
          icon: <MenuIcon fill="#f3171e" />
        });
      } finally {
        setDownloadingId(null);
      }
    }
  };

  /* const focusSettings = () => {
    toolbarRef.current?.focus();
  }; */

  const openDetails = (asset: any) => {
    showModal(<DetailsModal
      asset={asset}
      assetType={assetType}
      onAssetChange={async () => await setAsset(asset.id, asset.url)}
    />, window);
  };

  useEffect(() => {
    if (isSearchReady) {
      (async () => {
        await doSearchAndSetAssets(assetType);
      })();
    }
  }, [assetType, isSearchReady, doSearchAndSetAssets]);

  if (!appDetails) return null;

  return (<div className="tabcontents-wrap">
    <div className={joinClassNames('spinnyboi', (!loading && sizingStyles) ? 'loaded' : '')}>
      {/* cant use <SteamSpinner /> cause it has some extra elements that break the layout */}
      <img alt="Loading..." src="/images/steam_spinner.png" />
    </div>

    <Toolbar
      ref={toolbarRef}
      assetType={assetType}
      onFilterClick={() => openFilters(assetType)}
      onSizeChange={(size) => setSizingStyles(size)}
      disabled={loading}
    />
    {sizingStyles && <Focusable
      ref={mainContentRef}
      id="images-container"
      style={sizingStyles}
    >
      {assets.map((asset: any) => <Asset
        key={asset.id}
        scrollContainer={mainContentRef.current?.parentElement?.parentElement as Element}
        author={asset.author}
        notes={asset.notes}
        src={asset.thumb}
        width={asset.width}
        height={asset.height}
        humor={asset.humor}
        epilepsy={asset.epilepsy}
        nsfw={asset.nsfw}
        assetType={assetType}
        isAnimated={asset.thumb.includes('.webm')}
        isDownloading={downloadingId === asset.id}
        onActivate={() => setAsset(asset.id, asset.url)}
        onOKActionDescription={t('Apply {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}
        onSecondaryActionDescription={t('Filter')} // activate filter bar from anywhere
        onSecondaryButton={() => openFilters(assetType)}
        onMenuActionDescription={t('Details')}
        onMenuButton={() => openDetails(asset)}
      />)}
    </Focusable>}
  </div>);
};
  
export default AssetTab;