import {
  Focusable,
  SliderField,
  DialogButton,
  showModal,
  ModalRoot,
  SliderFieldProps,
  Spinner,
  SteamSpinner,
  joinClassNames
} from 'decky-frontend-lib';
import { useState, VFC, useRef, useEffect } from 'react';
import { useSGDB } from './hooks/useSGDB';
import Asset from './components/Asset';
import i18n from './utils/i18n';
import log from './utils/log';
import useSettings from './hooks/useSettings';

const sliderSizes = {
  'grid_p': {
    min: 100,
    max: 200,
    step: 5,
  },
  'grid_l': {
    min: 200,
    max: 300,
    step: 5,
  },
  'hero': {
    min: 320,
    max: 500,
    step: 5,
  },
  'logo': {
    min: 250,
    max: 500,
    step: 5,
  },
  'icon': {
    min: 100,
    max: 200,
    step: 5,
  },
};

const AssetTab: VFC<{assetType: SGDBAssetType}> = ({ assetType }) => {
  const { settings, set } = useSettings();
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
        await changeAssetFromUrl(url, assetType);
      } finally {
        setDownloading(false);
      }
    }
  };

  const handleSliderChange: SliderFieldProps['onChange'] = (size) => {
    setAssetSize(size);
    set(`assetSize_${assetType}`, size);
  };

  const focusSettings = () => {
    log('focusSettings');
    firstButtonRef.current?.focus();
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

  useEffect(() => {
    setAssetSize(settings[`assetSize_${assetType}`] ?? 120);
  }, [assetType, settings]);

  if (!appDetails) return null;

  return (<div className="tabcontents-wrap">
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
          onChange={handleSliderChange}
          onClick={(evt: Event) => evt.stopPropagation()}
          value={assetSize}
          layout="below"
          bottomSeparator="none"
          {...sliderSizes[assetType]}
        />
      </Focusable>
    </Focusable>
    <div className={joinClassNames('spinnyboi', assets.length > 0 ? 'loaded' : '')}>
      <img alt="Steam Spinner" src="/images/steam_spinner.png" />
    </div>
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
  </div>);
};
  
export default AssetTab;