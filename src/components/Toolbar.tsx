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

export type ToolbarProps = {
  assetType: SGDBAssetType;
  onSizeChange: (size: any) => void;
  onFilterClick: () => void;
};

export type ToolbarRefType = {
  focus: () => void;
  assetSizeStyleAttr: any;
};

const Toolbar = forwardRef(({ assetType, onSizeChange, onFilterClick }: ToolbarProps, ref: Ref<ToolbarRefType>) => {
  const { settings, set } = useSettings();
  const [sliderValue, setSliderValue] = useState<number>(120);
  const toolbarFocusRef = useRef<HTMLDivElement>(null);

  const handleSliderChange: SliderFieldProps['onChange'] = (size) => {
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

  useImperativeHandle(ref, () => ({
    focus: () => {
      toolbarFocusRef.current?.focus();
    },
    assetSizeStyleAttr,
  }), [assetSizeStyleAttr]);

  useEffect(() => {
    onSizeChange?.(assetSizeStyleAttr);
  }, [assetSizeStyleAttr, onSizeChange]);

  // Set initial slider value fron config or default
  useEffect(() => {
    setSliderValue(settings[`assetSize_${assetType}`] ?? defaultSliderSizes[assetType]);
  }, [assetType, settings]);
  
  return (
    <Focusable
      className="settings-container"
      focusClassName="force-show"
      focusWithinClassName="force-show"
      onOKActionDescription={t('Change Filters')}
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
            onOKActionDescription={t('Open Filters')}
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
