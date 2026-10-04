import { FC } from 'react';
import reactStringReplace from 'react-string-replace';
import { Marquee } from '@decky/ui';

import t from '../utils/i18n';

import AppGridFilterBar from './AppGridFilterBar';
import AdaptiveNavGlyph from './AdaptiveNavGlyph';

const strGameSelected = t('MSG_GAME_SELECTED', 'Selected {gameName}');
const strFilterActive = t('MSG_ASSETS_FILTERED', 'Some assets may be hidden due to filter');
const strFilterAndGame = t('MSG_GAME_SELECTED_AND_ASSETS_FILTERED', 'Selected {gameName} with filter');

const ResultsStateBar: FC<{
  loading: boolean;
  selectedGame: any;
  isFiltered: boolean;
  onClick: () => void;
}> = ({ loading, selectedGame, isFiltered, onClick }) => {
  if (loading) return null;
  if (selectedGame && !isFiltered) {
    return (
      <AppGridFilterBar style={{ marginTop: '1em' }} onClick={onClick}>
        {reactStringReplace(strGameSelected, '{gameName}', (_, i) => (
          <Marquee key={i} fadeLength={5} style={{ maxWidth: '350px' }}>&quot;{selectedGame.name}&quot;</Marquee>
        ))}
        <AdaptiveNavGlyph button={2} bAllowKeyboard />
      </AppGridFilterBar>
    );
  }
  if (!selectedGame && isFiltered) {
    return (
      <AppGridFilterBar style={{ marginTop: '1em' }} onClick={onClick}>
        {strFilterActive}
        <AdaptiveNavGlyph button={2} bAllowKeyboard />
      </AppGridFilterBar>
    );
  }
  if (selectedGame && isFiltered) {
    return (
      <AppGridFilterBar style={{ marginTop: '1em' }} onClick={onClick}>
        {reactStringReplace(strFilterAndGame, '{gameName}', (_, i) => (
          <Marquee key={i} fadeLength={5} style={{ maxWidth: '350px' }}>&quot;{selectedGame.name}&quot;</Marquee>
        ))}
        <AdaptiveNavGlyph button={2} bAllowKeyboard />
      </AppGridFilterBar>
    );
  }
  return null;
};

export default ResultsStateBar;
