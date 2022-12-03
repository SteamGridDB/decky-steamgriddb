import {
  DialogBody,
  ModalRoot,
  DialogControlsSection,
  DialogHeader,
  Field,
  ToggleField,
  DialogControlsSectionHeader
} from 'decky-frontend-lib';
import { FC, useCallback, useState } from 'react';
import t from '../utils/i18n';
import DropdownMultiselect from '../components/DropdownMultiselect';
import { MIMES, STYLES, DIMENSIONS } from '../constants';

const FiltersModal: FC<{
  closeModal?: () => void,
  assetType: SGDBAssetType,
  onSave: (assetType: SGDBAssetType, filters: any) => void,
  defaultFilters: any,
}> = ({ closeModal, assetType, onSave, defaultFilters }) => {
  const [styles, setStyles] = useState<string[]>(defaultFilters?.styles ?? STYLES[assetType].default);
  const [mimes, setMimes] = useState<string[]>(defaultFilters?.mimes ?? MIMES[assetType].default);
  const [dimensions, setDimensions] = useState<(string|number)[]>(defaultFilters?.dimensions ?? DIMENSIONS[assetType].default);
  const [animated, setAnimated] = useState<boolean>(defaultFilters?.animated ?? true);
  const [_static, setStatic] = useState<boolean>(defaultFilters?._static ?? true);
  const [adult, setAdult] = useState<boolean>(defaultFilters?.adult ?? false);
  const [humor, setHumor] = useState<boolean>(defaultFilters?.humor ?? true);
  const [epilepsy, setEpilepsy] = useState<boolean>(defaultFilters?.epilepsy ?? true);
  const [untagged, setUntagged] = useState<boolean>(defaultFilters?.untagged ?? true);

  /* Controls if the adult content desc shows, only want it to show when it gets toggled and not just when `adult` is true. */
  const [adultActivated, setAdultActivated] = useState<boolean>(false);

  const handleStyleSelect = useCallback((items) => {
    setStyles(items);
  }, []);

  const handleMimeSelect = useCallback((items) => {
    setMimes(items);
  }, []);

  const handleDimensionsSelect = useCallback((items) => {
    setDimensions(items);
  }, []);

  const handleClose = () => {
    onSave(assetType, {
      styles,
      dimensions,
      mimes,
      animated,
      _static,
      adult,
      humor,
      epilepsy,
      untagged
    });
    closeModal?.();
  };

  return (
    <ModalRoot className="sgdb-modal sgdb-modal-filters" closeModal={handleClose}>
      <DialogHeader>{t('Asset Filters')}</DialogHeader>
      <DialogBody>
        <DialogControlsSection>
          {(DIMENSIONS[assetType].options.length > 0) && <Field label={t('Dimensions')}>
            <DropdownMultiselect
              label={t('Dimensions')}
              items={DIMENSIONS[assetType].options}
              selected={dimensions}
              onSelect={handleDimensionsSelect}
            />
          </Field>}
          <Field label={t('Styles')}>
            <DropdownMultiselect
              label={t('Styles')}
              items={STYLES[assetType].options}
              selected={styles}
              onSelect={handleStyleSelect}
            />
          </Field>
          <Field label={t('File Types')}>
            <DropdownMultiselect
              label={t('File Types')}
              items={MIMES[assetType].options}
              selected={mimes}
              onSelect={handleMimeSelect}
            />
          </Field>
        </DialogControlsSection>
        <DialogControlsSection>
          <DialogControlsSectionHeader>{t('Types')}</DialogControlsSectionHeader>
          <ToggleField label={t('Animated')} checked={animated} onChange={(checked) => {
            if (!_static && !checked) {
              setStatic(true);
              setAnimated(false);
            } else {
              setAnimated(checked);
            }
          }} />
          <ToggleField label={t('Static')} checked={_static} onChange={(checked) => {
            if (!animated && !checked) {
              setAnimated(true);
              setStatic(false);
            } else {
              setStatic(checked);
            }
          }} />
        </DialogControlsSection>
        <DialogControlsSection>
          <DialogControlsSectionHeader>{t('Tags')}</DialogControlsSectionHeader>
          <ToggleField
            label={t('Adult Content')}
            description={adultActivated ? t('Might wanna do a quick shoulder check before saving.') : undefined}
            checked={adult}
            onChange={(checked) => {
              setAdult(checked);
              setAdultActivated(checked);
            }}
          />
          <ToggleField label={t('Humor')} checked={humor} onChange={setHumor} />
          <ToggleField label={t('Epilepsy')} checked={epilepsy} onChange={setEpilepsy} />
          <ToggleField label={t('Untagged')} checked={untagged} onChange={setUntagged} />
        </DialogControlsSection>
      </DialogBody>
    </ModalRoot>
  );
};

export default FiltersModal;
