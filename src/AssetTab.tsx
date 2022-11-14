import {
  Focusable,
  joinClassNames
} from 'decky-frontend-lib';
import { useState, VFC, useRef, useEffect } from 'react';
import { useSGDB } from './hooks/useSGDB';
import Asset from './components/Asset';
import i18n from './utils/i18n';
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
    <Toolbar ref={toolbarRef} assetType={assetType} onSizeChange={(size) => setSizingStyles(size)} />
    <div className={joinClassNames('spinnyboi', assets.length > 0 ? 'loaded' : '')}>
      <img alt="Steam Spinner" src="/images/steam_spinner.png" />
    </div>
    <Focusable
      ref={mainContentRef}
      className="image-container"
      style={sizingStyles}
    >
      {assets.map((asset) => <Asset
        key={asset.id}
        src={asset.thumb}
        width={asset.width}
        height={asset.height}
        isAnimated={asset.thumb.includes('.webm')}
        onActivate={() => onAssetClick(asset.url)}
        onOptionsActionDescription={i18n('Change Filters')} // activate filter bar from anywhere
        onOptionsButton={focusSettings}
      />)}
    </Focusable>
  </div>);
};
  
export default AssetTab;