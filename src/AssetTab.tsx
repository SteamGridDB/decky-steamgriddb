import {
  Focusable,
  SliderField,
  DialogButton,
  showModal,
  ModalRoot,
  joinClassNames
} from 'decky-frontend-lib';
import { useState, VFC, useRef } from 'react';
import useScrollDirection from './hooks/useScrollDirection';
import { useSGDB } from './SGDBProvider';
import AssetImage from './components/AssetImage';

import i18n from './utils/i18n';
import log from './utils/log';
  
const AssetTab: VFC = () => {
  const { appDetails, doSearch } = useSGDB();
  const [assetSize, setAssetSize] = useState<number>(120);
  
  const firstButtonRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const scrollDirection = useScrollDirection(mainContentRef.current as HTMLElement, 300, mainContentRef.current?.parentElement as HTMLElement);

  const onAssetClick = () => {
    log('cliccc');
    doSearch(String(appDetails?.unAppID));
  };

  const focusSettings = () => {
    log('focusSettings');
    firstButtonRef.current?.focus();
  };

  if (!appDetails) return null;

  return (<>
    <Focusable
      className={joinClassNames('settings-container', `scrolling-${scrollDirection}`)}
      focusClassName="force-show"
      focusWithinClassName="force-show"
      onOKActionDescription={i18n('Change Filters')}
      onActivate={focusSettings}
      onCancel={() => {
        log('Abort');
        (mainContentRef.current?.firstElementChild as HTMLElement)?.focus();
      }}
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
          /* @ts-ignore */
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
      {Array(30).fill(0).map((_, i) => <AssetImage
        onActivate={onAssetClick}
        onOptionsActionDescription={i18n('Change Filters')} // activate filter bar from anywhere
        onOptionsButton={focusSettings}
        key={i}
        width={600}
        height={900}
        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${appDetails.unAppID}/library_600x900.jpg`}
      />)}
    </Focusable>
  </>);
};
  
export default AssetTab;