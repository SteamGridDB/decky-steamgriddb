import {
  Focusable,
  joinClassNames,
  showModal,
  ModalRoot,
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

const AssetTab: VFC<{assetType: SGDBAssetType}> = ({ assetType }) => {
  const { isSearchReady, appDetails, doSearch, changeAssetFromUrl, serverApi } = useSGDB();
  const [assets, setAssets] = useState<Array<any>>([]);
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

  const focusSettings = () => {
    log('focusSettings');
    toolbarRef.current?.focus();
  };

  const openDetails = (asset: any) => {
    showModal(<DetailsModal
      asset={asset}
      assetType={assetType}
      onAssetChange={async () => await setAsset(asset.id, asset.url)}
    />, window);
  };

  const openFilters = () => {
    log('Open Filters');
    showModal(
      <ModalRoot bDisableBackgroundDismiss={false} bHideCloseIcon={false}>
        chungus
      </ModalRoot>,
      window,
      {
        fnOnClose: () => {
          log('close filters modal');
        },
        strTitle: 'Search Filters',
      }
    );
  };

  useEffect(() => {
    if (isSearchReady) {
      (async () => {
        const results = await doSearch(assetType);
        setAssets(results);
      })().catch(() => {
        //
      });
    }
  }, [assetType, doSearch, isSearchReady]);

  if (!appDetails) return null;

  return (<div className="tabcontents-wrap">
    <div className={joinClassNames('spinnyboi', (assets.length > 0 && sizingStyles) ? 'loaded' : '')}>
      <img alt="Steam Spinner" src="/images/steam_spinner.png" />
    </div>
    {(assets.length > 0) && <Toolbar ref={toolbarRef} assetType={assetType} onFilterClick={openFilters} onSizeChange={(size) => setSizingStyles(size)} />}
    <Focusable
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
        onOKActionDescription={t('Apply Asset')}
        onOptionsActionDescription={t('Change Filters')} // activate filter bar from anywhere
        onOptionsButton={openFilters}
        onSecondaryActionDescription={t('Details')}
        onSecondaryButton={() => openDetails(asset)}
      />)}
    </Focusable>
  </div>);
};
  
export default AssetTab;