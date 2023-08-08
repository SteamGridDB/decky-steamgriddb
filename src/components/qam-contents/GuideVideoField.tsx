import { Field, ProgressBar } from 'decky-frontend-lib';
import { useState } from 'react';
import { HiOutlineChevronRight } from 'react-icons/hi2';
import reactStringReplace from 'react-string-replace';

import HowToVideo from '../../../assets/howto.webm';

import FooterGlyph from '../FooterGlyph';
import t from '../../utils/i18n';

const strInstructions = t('MSG_USAGE_INSTRUCTIONS', 'Select a game {arrow} {optionsButton} {arrow} "{ACTION_CHANGE_ARTWORK}"')
  .replace('{ACTION_CHANGE_ARTWORK}', t('ACTION_CHANGE_ARTWORK', 'Change Artwork...'));
const changeInstructions = reactStringReplace(reactStringReplace(strInstructions, '{arrow}', (_, i) => (
  <HiOutlineChevronRight key={i} strokeWidth="4" style={{ height: '0.65em' }} />
)), '{optionsButton}', (_, i) => (
  <FooterGlyph key={i} button={11} type={0} size={0} />
));

const GuideVideoField: typeof Field = (props) => {
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const handlePlay = (evt: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = (evt.target as HTMLVideoElement);
    setDuration(target.duration);
    setProgress(100);
  };

  const handleEnded = (evt: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = (evt.target as HTMLVideoElement);
    setDuration(0.4);
    setProgress(0);

    // replay after .5s
    setTimeout(() => {
      target.play();
    }, 500);
  };

  return (
    <Field
      padding="none"
      childrenLayout="below"
      childrenContainerWidth="max"
      bottomSeparator="none"
      description={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {changeInstructions}
        </div>
      }
      {...props}
    >
      <video
        src={HowToVideo}
        style={{ maxWidth: '100%' }}
        autoPlay
        muted
        loop={false} // loop it manually
        onPlay={handlePlay}
        onEnded={handleEnded}
      />
      <ProgressBar focusable={false} nProgress={progress} nTransitionSec={duration} />
    </Field>
  );
};

export default GuideVideoField;