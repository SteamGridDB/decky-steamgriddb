import {
  Focusable,
  joinClassNames,
  showModal,
} from 'decky-frontend-lib';
import { useState, VFC, useRef, useEffect, useCallback } from 'react';
import isEqual from 'react-fast-compare';
import { useSGDB } from './hooks/useSGDB';
import Asset from './components/Asset';
import t from './utils/i18n';
import log from './utils/log';
import Toolbar, { ToolbarRefType } from './components/Toolbar';
import MenuIcon from './components/MenuIcon';
import DetailsModal from './Modals/DetailsModal';
import { SGDB_ASSET_TYPE_READABLE } from './constants';
import FiltersModal from './Modals/FiltersModal';
import useSettings from './hooks/useSettings';

const AssetTab: VFC<{assetType: SGDBAssetType}> = ({ assetType }) => {
  const { set, get } = useSettings();
  const { isSearchReady, appDetails, doSearch, changeAssetFromUrl, serverApi } = useSGDB();
  const [assets, setAssets] = useState<Array<any>>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [sizingStyles, setSizingStyles] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

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

  const handleFiltersSave = useCallback(async (filters) => {
    set(`filters_${assetType}`, filters);
    const currentFilters = await get(`filters_${assetType}`, null);
    if (!isEqual(filters, currentFilters)) {
      setLoading(true);
      setAssets([]);
      setAssets(await doSearch(assetType, filters));
      setLoading(false);
    }
  }, [assetType, doSearch, get, serverApi.toaster, set]);

  const openDetails = (asset: any) => {
    showModal(<DetailsModal
      asset={asset}
      assetType={assetType}
      onAssetChange={async () => await setAsset(asset.id, asset.url)}
    />, window);
  };

  const openFilters = async () => {
    log('Open Filters');
    const defaultFilters = await get(`filters_${assetType}`, null);
    showModal(<FiltersModal assetType={assetType} onSave={handleFiltersSave} defaultFilters={defaultFilters} />, window);
  };

  useEffect(() => {
    if (isSearchReady) {
      (async () => {
        setLoading(true);
        const filters = await get(`filters_${assetType}`, null);
        const results = await doSearch(assetType, filters);
        setLoading(false);
        setAssets(results);
      })().catch(() => {
        //
      });
    }
  }, [assetType, doSearch, get, isSearchReady]);

  if (!appDetails) return null;

  return (<div className="tabcontents-wrap">
    <div className={joinClassNames('spinnyboi', (!loading && sizingStyles) ? 'loaded' : '')}>
      {/* cant use <SteamSpinner /> cause it has some extra elements that break the layout */}
      <img alt="Loading..." src="/images/steam_spinner.png" />
    </div>

    <Toolbar
      ref={toolbarRef}
      assetType={assetType}
      onFilterClick={openFilters}
      onSizeChange={(size) => setSizingStyles(size)}
      disabled={loading}
    />

    {sizingStyles && <Focusable
      ref={mainContentRef}
      id="images-container"
      style={sizingStyles}
    >
      {assets.map((asset) => <Asset
        key={asset.id}
        scrollContainer={mainContentRef.current?.parentElement?.parentElement as Element}
        author={asset.author}
        notes={asset.notes}
        src={asset.thumb}
        width={asset.width}
        height={asset.height}
        assetType={assetType}
        isAnimated={asset.thumb.includes('.webm')}
        isDownloading={downloadingId === asset.id}
        onActivate={() => setAsset(asset.id, asset.url)}
        onOKActionDescription={t('Apply {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}
        onOptionsActionDescription={t('Filter')} // activate filter bar from anywhere
        onOptionsButton={openFilters}
        onSecondaryActionDescription={t('Details')}
        onSecondaryButton={() => openDetails(asset)}
      />)}
    </Focusable>}
  </div>);
};
  
export default AssetTab;