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
import { useState, VFC, useRef, useEffect, useMemo } from 'react';
import { useSGDB } from './hooks/useSGDB';
import Asset from './components/Asset';
import i18n from './utils/i18n';
import log from './utils/log';
import useSettings from './hooks/useSettings';

const sliderProps = {
  grid_p: {
    min: 100,
    max: 200,
    step: 5,
  },
  grid_l: {
    min: 100,
    max: 200,
    step: 5,
  },
  hero: {
    min: 1,
    max: 6,
    step: 1,
    notchCount: 6,
    notchTicksVisible: true
  },
  logo: {
    min: 1,
    max: 6,
    step: 1,
    notchCount: 6,
    notchTicksVisible: true
  },
  icon: {
    min: 100,
    max: 200,
    step: 5,
  },
};

const defaultSliderSizes = {
  grid_p: 120,
  grid_l: 126,
  hero: 4,
  logo: 4,
  icon: 120,
};

const AssetTab: VFC<{assetType: SGDBAssetType}> = ({ assetType }) => {
  const { settings, set } = useSettings();
  const { isSearchReady, appDetails, doSearch, changeAssetFromUrl } = useSGDB();
  const [sliderValue, setSliderValue] = useState<number>(120);
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
    log(size);
    setSliderValue(size);
    set(`assetSize_${assetType}`, size);
  };

  const assetSizeStyleAttr = useMemo(() => {
    if (['hero', 'logo'].includes(assetType)) {
      const percent = 100 / (sliderProps[assetType].max - sliderValue + sliderProps[assetType].min);
      return {
        gridTemplateColumns: `repeat(auto-fill, minmax(calc(${percent}% - .5em), 1fr))`
      };
    }
    return {
      ['--asset-size' as string]: `${sliderValue}px`
    };
  }, [assetType, sliderValue]);

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
    // Set initial slider value
    log('initial slider value', settings[`assetSize_${assetType}`] ?? defaultSliderSizes[assetType]);
    setSliderValue(settings[`assetSize_${assetType}`] ?? defaultSliderSizes[assetType]);
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
        <Focusable
          style={{
            alignItems: 'center',
            display: 'flex'
          }}
        >
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
          value={sliderValue}
          layout="below"
          bottomSeparator="none"
          {...sliderProps[assetType]}
        />
      </Focusable>
    </Focusable>
    <div className={joinClassNames('spinnyboi', assets.length > 0 ? 'loaded' : '')}>
      <img alt="Steam Spinner" src="/images/steam_spinner.png" />
    </div>
    <Focusable
      ref={mainContentRef}
      className="image-container"
      style={assetSizeStyleAttr}
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