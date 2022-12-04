import { FC } from 'react';
import AppGridFilterBar from './AppGridFilterBar';
import Marquee from './Marquee';
import FooterGlyph from './FooterGlyph';

const ResultsStateBar: FC<{
  loading: boolean;
  selectedGame: any;
  isFiltered: boolean;
  onClick: () => void;
}> = ({ loading, selectedGame, isFiltered, onClick }) => {
  if (loading) return null;
  if (selectedGame && !isFiltered) {
    return <AppGridFilterBar style={{ marginTop: '1em' }} onClick={onClick}>
      Selected
      <Marquee fadeLength={5} style={{ maxWidth: '350px' }}>&quot;{selectedGame.name}&quot;</Marquee>
      <FooterGlyph button={2} type={0} size={0} />
    </AppGridFilterBar>;
  }
  if (!selectedGame && isFiltered) {
    return <AppGridFilterBar style={{ marginTop: '1em' }} onClick={onClick}>
      Some assets may be hidden due to filter <FooterGlyph button={2} type={0} size={0} />
    </AppGridFilterBar>;
  }
  if (selectedGame && isFiltered) {
    return <AppGridFilterBar style={{ marginTop: '1em' }} onClick={onClick}>
      Selected
      <Marquee fadeLength={5} style={{ maxWidth: '350px' }}>&quot;{selectedGame.name}&quot;</Marquee>
      with filter <FooterGlyph button={2} type={0} size={0} />
    </AppGridFilterBar>;
  }
  return null;
};

export default ResultsStateBar;
