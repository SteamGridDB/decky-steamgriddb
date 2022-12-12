import { FC } from 'react';
import reactStringReplace from 'react-string-replace';
import { Marquee } from 'decky-frontend-lib';

import t from '../utils/i18n';

import AppGridFilterBar from './AppGridFilterBar';
import FooterGlyph from './FooterGlyph';

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
        <FooterGlyph button={2} type={0} size={0} />
      </AppGridFilterBar>
    );
  }
  if (!selectedGame && isFiltered) {
    return (
      <AppGridFilterBar style={{ marginTop: '1em' }} onClick={onClick}>
        {strFilterActive} <FooterGlyph button={2} type={0} size={0} />
      </AppGridFilterBar>
    );
  }
  if (selectedGame && isFiltered) {
    return (
      <AppGridFilterBar style={{ marginTop: '1em' }} onClick={onClick}>
        {reactStringReplace(strFilterAndGame, '{gameName}', (_, i) => (
          <Marquee key={i} fadeLength={5} style={{ maxWidth: '350px' }}>&quot;{selectedGame.name}&quot;</Marquee>
        ))}
        <FooterGlyph button={2} type={0} size={0} />
      </AppGridFilterBar>
    );
  }
  return null;
};

export default ResultsStateBar;
