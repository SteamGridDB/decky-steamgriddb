import {
  DialogBody,
  ModalRoot,
  DialogControlsSection,
  DialogHeader,
  Field,
  ToggleField,
  DialogControlsSectionHeader
} from 'decky-frontend-lib';
import { FC, useCallback, useState, useEffect } from 'react';
import t from '../utils/i18n';
import DropdownMultiselect from '../components/DropdownMultiselect';
import { MIMES, STYLES, DIMENSIONS } from '../constants';

const FiltersModal: FC<{
  closeModal?: () => void,
  assetType: SGDBAssetType,
  onSave: (filters: any) => void,
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
    onSave({
      styles,
      dimensions,
      mimes,
      animated,
      _static,
      adult,
      humor,
      epilepsy
    });
    closeModal?.();
  };

  return (
    <ModalRoot
      className="sgdb-modal sgdb-filters-details"
      closeModal={handleClose}
      bDisableBackgroundDismiss={false}
      bHideCloseIcon={false}
      bOKDisabled
    >
      <DialogHeader>{t('Filter')}</DialogHeader>
      <DialogBody>
        <DialogControlsSection>
          {(DIMENSIONS[assetType].options.length > 0) && <Field 
            label={t('Dimensions')}
            childrenContainerWidth={assetType === 'icon' ? 'fixed' : undefined}
          >
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
          <ToggleField label={t('Adult Content')} checked={adult} onChange={setAdult} />
          <ToggleField label={t('Humor')} checked={humor} onChange={setHumor} />
          <ToggleField label={t('Epilepsy')} checked={epilepsy} onChange={setEpilepsy} />
        </DialogControlsSection>
      </DialogBody>
    </ModalRoot>
  );
};

export default FiltersModal;
