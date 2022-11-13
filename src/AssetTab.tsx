import {
  Focusable,
  SliderField,
  DialogButton,
  showModal,
  ModalRoot,
} from 'decky-frontend-lib';
import { useState, VFC, useRef, useEffect } from 'react';
import { useSGDB } from './hooks/useSGDB';
import Asset from './components/Asset';
import i18n from './utils/i18n';
import log from './utils/log';
import { ASSET_TYPE } from './constants';

const AssetTab: VFC = () => {
  const { isSearchReady, appDetails, doSearch, changeAssetFromUrl } = useSGDB();
  const [assetSize, setAssetSize] = useState<number>(120);
  const [assets, setAssets] = useState<Array<any>>([]);
  const [downloading, setDownloading] = useState<boolean>(false);
  
  const firstButtonRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const onAssetClick = async (url: string) => {
    log('cliccc');
    if (!downloading) {
      try {
        setDownloading(true);
        await changeAssetFromUrl(url, ASSET_TYPE.GRID_PORTRAIT);
      } finally {
        setDownloading(false);
      }
    }
  };

  const focusSettings = () => {
    log('focusSettings');
    firstButtonRef.current?.focus();
  };

  useEffect(() => {
    if (isSearchReady) {
      (async () => {
        const results = await doSearch();
        setAssets(results);
      })().catch((err) => {
        //
      });
    }
  }, [isSearchReady]);

  if (!appDetails) return null;

  return (<>
    <Focusable
      className="settings-container"
      focusClassName="force-show"
      focusWithinClassName="force-show"
      onOKActionDescription={i18n('Change Filters')}
      onActivate={focusSettings}
    >
      <Focusable className="action-buttons">
        <Focusable>
          <DialogButton
            ref={firstButtonRef}
            noFocusRing
            onOKActionDescription={i18n('Open Filters')}
            onClick={(evt: Event) => {
              evt.stopPropagation();
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
            }}
          >
            {i18n('Filter')}
          </DialogButton>
        </Focusable>
        <SliderField
          /* @ts-ignore: className is a valid prop */
          className="size-slider"
          onChange={(size) => setAssetSize(size)}
          onClick={(evt: Event) => evt.stopPropagation()}
          value={assetSize}
          layout="below"
          bottomSeparator="none"
          min={100}
          max={200}
          step={5}
        />
      </Focusable>
    </Focusable>
    <Focusable
      ref={mainContentRef}
      className="image-container"
      style={{
        ['--grid-size' as string]: `${assetSize}px`
      }}
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
  </>);
};
  
export default AssetTab;