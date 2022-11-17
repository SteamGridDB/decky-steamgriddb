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

const AssetTab: VFC<{assetType: SGDBAssetType}> = ({ assetType }) => {
  const { isSearchReady, appDetails, doSearch, changeAssetFromUrl } = useSGDB();
  const [assets, setAssets] = useState<Array<any>>([]);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sizingStyles, setSizingStyles] = useState<any>(undefined);
  
  const toolbarRef = useRef<ToolbarRefType>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const onAssetClick = async (url: string) => {
    log('cliccc');
    if (!downloading) {
      try {
        setDownloading(true);
        await changeAssetFromUrl(url, assetType);
      } finally {
        setDownloading(false);
      }
    }
  };

  const focusSettings = () => {
    log('focusSettings');
    toolbarRef.current?.focus();
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
    <Toolbar ref={toolbarRef} assetType={assetType} onFilterClick={openFilters} onSizeChange={(size) => setSizingStyles(size)} />
    <div className={joinClassNames('spinnyboi', assets.length > 0 ? 'loaded' : '')}>
      <img alt="Steam Spinner" src="/images/steam_spinner.png" />
    </div>
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
        isAnimated={asset.thumb.includes('.webm')}
        onActivate={() => onAssetClick(asset.url)}
        onOptionsActionDescription={t('Change Filters')} // activate filter bar from anywhere
        onOptionsButton={openFilters}
      />)}
    </Focusable>
  </div>);
};
  
export default AssetTab;