import {
  Focusable,
  SliderField,
  DialogButton,
  SliderFieldProps
} from 'decky-frontend-lib';
import { useState, useImperativeHandle, useRef, forwardRef, useEffect, useMemo, Ref } from 'react';

import t from '../utils/i18n';
import useSettings from '../hooks/useSettings';

const sliderProps = {
  grid_p: {
    min: 100,
    max: 200,
    step: 5,
  },
  grid_l: {
    min: 160,
    max: 280,
    step: 5,
  },
  hero: {
    min: 2,
    max: 4,
    step: 1,
    notchCount: 3,
    notchTicksVisible: true
  },
  logo: {
    min: 2,
    max: 6,
    step: 1,
    notchCount: 5,
    notchTicksVisible: true
  },
  icon: {
    min: 100,
    max: 200,
    step: 5,
  },
};

const defaultSliderSizes = {
  grid_p: 150,
  grid_l: 200,
  hero: 3,
  logo: 4,
  icon: 120,
};

export interface Toolbar {
  assetType: SGDBAssetType;
  onSizeChange: (size: any) => void;
  onFilterClick: () => void;
  disabled: boolean;
}

export type ToolbarRefType = {
  focus: () => void;
  assetSizeStyleAttr: any;
};

const Toolbar = forwardRef(({ assetType, onSizeChange, onFilterClick, disabled = false }: Toolbar, ref: Ref<ToolbarRefType>) => {
  const { set, get } = useSettings();
  const [sliderValue, setSliderValue] = useState<number>(120);
  const toolbarFocusRef = useRef<HTMLDivElement>(null);

  const handleSliderChange: SliderFieldProps['onChange'] = (size) => {
    setSliderValue(size);
    set(`zoomlevel_${assetType}`, size);
  };

  const assetSizeStyleAttr = useMemo(() => {
    if (['hero', 'logo'].includes(assetType)) {
      const percent = 100 / (sliderProps[assetType].max - sliderValue + sliderProps[assetType].min);
      return {
        gridTemplateColumns: `repeat(auto-fill, minmax(calc(${percent}% - .65em), 1fr))`
      };
    }
    return {
      ['--asset-size' as string]: `${sliderValue}px`
    };
  }, [assetType, sliderValue]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      toolbarFocusRef.current?.focus();
    },
    assetSizeStyleAttr,
  }), [assetSizeStyleAttr]);

  useEffect(() => {
    onSizeChange?.(assetSizeStyleAttr);
  }, [assetSizeStyleAttr, onSizeChange]);

  // Set initial slider value from config or default
  useEffect(() => {
    (async () => {
      const defSize = await get(`zoomlevel_${assetType}`, defaultSliderSizes[assetType]);
      setSliderValue(defSize);
    })();
  }, [assetType, get]);
  
  if (disabled) return null;

  return (
    <Focusable
      className="settings-container"
      focusClassName="force-show"
      focusWithinClassName="force-show"
      onOKActionDescription={t('Filter')}
      onActivate={() => toolbarFocusRef.current?.focus()}
      onClick={(evt) => evt.preventDefault()} // Don't focus if using UI with a pointer
    >
      <Focusable className="action-buttons">
        <Focusable
          style={{
            alignItems: 'center',
            display: 'flex'
          }}
        >
          <DialogButton
            ref={toolbarFocusRef}
            noFocusRing
            onOKActionDescription={t('Filter')}
            onClick={onFilterClick}
          >
            {t('Filter')}
          </DialogButton>
        </Focusable>
        <SliderField
          /* @ts-ignore: className is a valid prop */
          className="size-slider"
          onChange={handleSliderChange}
          value={sliderValue}
          layout="below"
          bottomSeparator="none"
          {...sliderProps[assetType]}
        />
      </Focusable>
    </Focusable>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
