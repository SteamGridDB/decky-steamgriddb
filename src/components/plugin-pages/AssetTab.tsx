import { Focusable, joinClassNames, showModal } from '@decky/ui';
import { toaster } from '@decky/api';
import { useState, FC, useRef, useEffect, useMemo } from 'react';

import { useSGDB } from '../../hooks/useSGDB';
import Asset from '../asset/Asset';
import t from '../../utils/i18n';
import Toolbar, { ToolbarRefType } from '../qam-contents/Toolbar';
import MenuIcon from '../Icons/MenuIcon';
import DetailsModal from '../../modals/DetailsModal';
import { SGDB_ASSET_TYPE_READABLE } from '../../constants';
import useAssetSearch from '../../hooks/useAssetSearch';
import useSettings from '../../hooks/useSettings';
import ResultsStateBar from '../ResultsStateBar';
import LogoPositionerModal from '../../modals/LogoPositionerModal';
import OfficialAssetsModal from '../../modals/OfficialAssetsModal';
import Motd from '../Motd';

const AssetTab: FC<{ assetType: SGDBAssetType }> = ({ assetType }) => {
  const { get } = useSettings();
  const {
    loading: searchLoading,
    assets,
    searchAndSetAssets,
    loadMore,
    openFilters,
    isFilterActive,
    selectedGame,
    externalSgdbData,
    endReached,
  } = useAssetSearch();
  const { appOverview, changeAssetFromUrl } = useSGDB();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [sizingStyles, setSizingStyles] = useState<any>(undefined);
  const [tabLoading, setTabLoading] = useState(true);
  const [scrollContainerHeight, setScrollContainerHeight] = useState<string>();
  const loading = useMemo(() => !(!searchLoading && !tabLoading), [searchLoading, tabLoading]);

  const toolbarRef = useRef<ToolbarRefType>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const intersectRef = useRef<HTMLDivElement>(null);

  const handleFilterClick = () => openFilters(assetType);
  const handleLogoPosClick = () => showModal(<LogoPositionerModal appId={appOverview.appid} />, window);
  const handleOfficialAssetsClick = () => {
    showModal((
      <OfficialAssetsModal
        onAssetChange={async (url) => {
          try {
            await changeAssetFromUrl(url, assetType);
            toaster.toast({
              title: appOverview?.display_name,
              body: t('MSG_ASSET_APPLY_SUCCESS', '{assetType} has been successfully applied!').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType]),
              icon: <MenuIcon />,
              duration: 1500,
            });
          } catch (err: any) {
            toaster.toast({
              title: t('MSG_ASSET_APPLY_ERROR', 'There was a problem applying this asset.'),
              body: err.message,
              icon: <MenuIcon fill="#f3171e" />,
            });
          }
        }}
        assetType={assetType}
        data={externalSgdbData}
      />
    ), window);
  };

  const setAsset = async (assetId: number, url: string) => {
    if (!downloadingId) {
      try {
        setDownloadingId(assetId);
        await changeAssetFromUrl(url, assetType);
        toaster.toast({
          title: appOverview?.display_name,
          body: t('MSG_ASSET_APPLY_SUCCESS', '{assetType} has been successfully applied!').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType]),
          icon: <MenuIcon />,
          duration: 1500,
        });
      } catch (err: any) {
        toaster.toast({
          title: t('MSG_ASSET_APPLY_ERROR', 'There was a problem applying this asset.'),
          body: err.message,
          icon: <MenuIcon fill="#f3171e" />,
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
    showModal((
      <DetailsModal
        asset={asset}
        assetType={assetType}
        onAssetChange={async () => await setAsset(asset.id, asset.url)}
      />
    ), window);
  };

  useEffect(() => {
    (async () => {
      setTabLoading(true);
      const filters = await get(`filters_${assetType}`, null);
      await searchAndSetAssets(assetType, 0, filters, () => {
        setTabLoading(false);
      });
    })();
  }, [searchAndSetAssets, assetType, get]);

  useEffect(() => {
    if (!intersectRef.current || loading || endReached) return;

    const observer = new IntersectionObserver(([entry], observer) => {
      if (entry.isIntersecting) {
        loadMore(assetType, (res) => {
          // End reached
          if (res.length === 0) {
            observer.disconnect();
          }
        });
      }
    }, { threshold: 0, root: mainContentRef.current?.parentElement?.parentElement });
    observer.observe(intersectRef.current);

    // Hack to work around CSS themes that don't adjust padding of tabbed content when changing the size of the footer.
    if (mainContentRef.current?.parentElement?.parentElement) {
      const pb = window.getComputedStyle(mainContentRef.current.parentElement.parentElement).getPropertyValue('padding-bottom');
      setScrollContainerHeight(pb);
    }
    return () => {
      observer.disconnect();
    };
  }, [assetType, endReached, loadMore, loading]);

  if (!appOverview) return null;

  return (
    <div className="tabcontents-wrap">
      <div className={joinClassNames('spinnyboi', !loading ? 'loaded' : '')}>
        {/* cant use <SteamSpinner /> cause it has some extra elements that break the layout */}
        <img alt="Loading..." src="/images/steam_spinner.png" />
      </div>

      <Toolbar
        ref={toolbarRef}
        assetType={assetType}
        onFilterClick={handleFilterClick}
        onLogoPosClick={handleLogoPosClick}
        onOfficialAssetsClick={handleOfficialAssetsClick}
        onSizeChange={(size) => setSizingStyles(size)}
        disabled={tabLoading}
        noFocusRing={searchLoading || tabLoading}
      />

      <Motd disabled={tabLoading} noFocusRing={searchLoading || tabLoading} />

      <ResultsStateBar
        loading={loading}
        selectedGame={selectedGame}
        isFiltered={isFilterActive}
        onClick={handleFilterClick}
      />

      <Focusable
        ref={mainContentRef}
        id="images-container"
        style={sizingStyles}
      >
        {!tabLoading && (
          <>
            {assets.map((asset: any) => (
              <Asset
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
                onOKActionDescription={t('ACTION_ASSET_APPLY', 'Apply {assetType}').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}
                onSecondaryActionDescription={t('ACTION_OPEN_FILTER', 'Filter')} // activate filter bar from anywhere
                onSecondaryButton={handleFilterClick}
                onMenuActionDescription={t('ACTION_OPEN_DETAILS', 'Details')}
                onMenuButton={() => openDetails(asset)}
              />
            ))}
            {/* Load more if spinner in view */}
            <div ref={intersectRef} style={{ gridColumn: '1 / -1', height: '5px', marginBottom: scrollContainerHeight }} />
            {assets.length === 0 && <div style={{ gridColumn: '1 / -1', justifySelf: 'center' }}>{t('Search_NoResults', 'No Results Found.', true)}</div>}
          </>
        )}
      </Focusable>
    </div>
  );
};

export default AssetTab;