import {
  DialogBody,
  ModalRoot,
  DialogControlsSection,
  DialogHeader,
  Field,
  ToggleField,
  DialogControlsSectionHeader,
  DialogButton,
  showModal,
  DialogFooter,
  Marquee,
} from 'decky-frontend-lib';
import { FC, useCallback, useMemo, useState } from 'react';

import t from '../utils/i18n';
import DropdownMultiselect from '../components/DropdownMultiselect';
import { MIMES, STYLES, DIMENSIONS, SGDB_ASSET_TYPE_READABLE } from '../constants';
import compareFilterWithDefaults from '../utils/compareFilterWithDefaults';

import GameSelectionModal from './GameSelectionModal';

const FiltersModal: FC<{
  closeModal?: () => void,
  assetType: SGDBAssetType,
  onSave: (assetType: SGDBAssetType, filters: any, selectedGame?: any) => void,
  defaultFilters: any,
  selectableGame: boolean;
  defaultSelectedGame: any;
  searchGames: (term: string) => Promise<any[]>;
}> = ({
  closeModal,
  assetType,
  onSave,
  defaultFilters,
  selectableGame,
  defaultSelectedGame,
  searchGames,
}) => {
  const [styles, setStyles] = useState<string[]>(defaultFilters?.styles ?? STYLES[assetType].default);
  const [mimes, setMimes] = useState<string[]>(defaultFilters?.mimes ?? MIMES[assetType].default);
  const [dimensions, setDimensions] = useState<(string|number)[]>(defaultFilters?.dimensions ?? DIMENSIONS[assetType].default);
  const [animated, setAnimated] = useState<boolean>(defaultFilters?.animated ?? true);
  const [_static, setStatic] = useState<boolean>(defaultFilters?._static ?? true);
  const [adult, setAdult] = useState<boolean>(defaultFilters?.adult ?? false);
  const [humor, setHumor] = useState<boolean>(defaultFilters?.humor ?? true);
  const [epilepsy, setEpilepsy] = useState<boolean>(defaultFilters?.epilepsy ?? true);
  const [untagged, setUntagged] = useState<boolean>(defaultFilters?.untagged ?? true);
  const filters = useMemo(() => ({
    styles, dimensions, mimes, animated, _static, adult, humor, epilepsy, untagged,
  }), [styles, dimensions, mimes, animated, _static, adult, humor, epilepsy, untagged]);

  const [selectedGame, setSelectedGame] = useState(defaultSelectedGame);

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
    onSave(assetType, filters, selectedGame);
    closeModal?.();
  };

  const resetFilters = () => {
    setStyles(STYLES[assetType].default);
    setMimes(MIMES[assetType].default);
    setDimensions(DIMENSIONS[assetType].default);
    setAnimated(true);
    setStatic(true);
    setHumor(true);
    setEpilepsy(true);
    setUntagged(true);
  };

  return (
    <ModalRoot className="sgdb-modal sgdb-modal-filters" closeModal={handleClose}>
      <DialogHeader>{t('LABEL_FILTER_MODAL_TITLE', '{assetType} Filter').replace('{assetType}', SGDB_ASSET_TYPE_READABLE[assetType])}</DialogHeader>
      <DialogBody>
        <DialogControlsSection>
          {selectableGame && (
            <Field label={t('LABEL_FILTER_GAME', 'Game')}>
              <DialogButton onClick={() => {
                showModal(
                  <GameSelectionModal
                    defaultTerm={selectedGame.name}
                    searchGames={searchGames}
                    onSelect={(game: any) => {
                      setSelectedGame(game);
                    }}
                  />
                );
              }}
              >
                <Marquee center>
                  {selectedGame.name}
                </Marquee>
              </DialogButton>
            </Field>
          )}
          {(DIMENSIONS[assetType].options.length > 0) && (
            <Field label={t('LABEL_FILTER_DIMENSIONS', 'Dimensions')}>
              <DropdownMultiselect
                label={t('LABEL_FILTER_DIMENSIONS', 'Dimensions')}
                items={DIMENSIONS[assetType].options}
                selected={dimensions}
                onSelect={handleDimensionsSelect}
              />
            </Field>
          )}
          <Field label={t('LABEL_FILTER_STYLES', 'Styles')}>
            <DropdownMultiselect
              label={t('LABEL_FILTER_STYLES', 'Styles')}
              items={STYLES[assetType].options}
              selected={styles}
              onSelect={handleStyleSelect}
            />
          </Field>
          <Field label={t('LABEL_FILTER_FILE_TYPES', 'File Types')}>
            <DropdownMultiselect
              label={t('LABEL_FILTER_FILE_TYPES', 'File Types')}
              items={MIMES[assetType].options}
              selected={mimes}
              onSelect={handleMimeSelect}
            />
          </Field>
        </DialogControlsSection>
        <DialogControlsSection>
          <DialogControlsSectionHeader>{t('LABEL_FILTER_ANIMATION_TYPE_TITLE', 'Types')}</DialogControlsSectionHeader>
          <ToggleField label={t('LABEL_FILTER_TYPE_ANIMATED', 'Animated')} checked={animated} onChange={(checked) => {
            if (!_static && !checked) {
              setStatic(true);
              setAnimated(false);
            } else {
              setAnimated(checked);
            }
          }}
          />
          <ToggleField label={t('LABEL_FILTER_TYPE_STATIC', 'Static')} checked={_static} onChange={(checked) => {
            if (!animated && !checked) {
              setAnimated(true);
              setStatic(false);
            } else {
              setStatic(checked);
            }
          }}
          />
        </DialogControlsSection>
        <DialogControlsSection>
          <DialogControlsSectionHeader>{t('LABEL_FILTER_TAGS_TITLE', 'Tags')}</DialogControlsSectionHeader>
          <ToggleField
            label={t('LABEL_FILTER_TAG_NSFW', 'Adult Content')}
            description={adultActivated ? t('MSG_FILTER_TAG_NSFW_ENABLED', 'Might wanna do a quick shoulder check.') : undefined}
            checked={adult}
            onChange={(checked) => {
              setAdult(checked);
              setAdultActivated(checked);
            }}
          />
          <ToggleField label={t('LABEL_FILTER_TAG_HUMOR', 'Humor')} checked={humor} onChange={setHumor} />
          <ToggleField label={t('LABEL_FILTER_TAG_EPILEPSY', 'Epilepsy')} checked={epilepsy} onChange={setEpilepsy} />
          <ToggleField label={t('LABEL_FILTER_TAG_UNTAGGED', 'Untagged')} checked={untagged} onChange={setUntagged} />
        </DialogControlsSection>
      </DialogBody>
      {compareFilterWithDefaults(assetType, filters) && (
        <DialogFooter>
          <DialogButton onClick={resetFilters}>{t('ACTION_FILTER_RESET', 'Reset Filters')}</DialogButton>
        </DialogFooter>
      )}
    </ModalRoot>
  );
};

export default FiltersModal;
