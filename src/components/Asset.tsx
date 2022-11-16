import { VFC } from 'react';
import { Focusable, FocusableProps, FooterLegendProps } from 'decky-frontend-lib';
import { LazyImage } from './LazyImage';
import FooterGlyph from './FooterGlyph';
import t from '../utils/i18n';

interface AssetProps extends FooterLegendProps {
  width: number;
  height: number;
  src: string;
  author: any;
  isAnimated: boolean;
  onActivate?: FocusableProps['onActivate'];
  scrollContainer?: Element;
  notes?: string;
}

const Asset: VFC<AssetProps> = ({
  width,
  height,
  src,
  author,
  isAnimated,
  onActivate,
  scrollContainer,
  notes = null,
  ...rest
}) => (
  <div className="image-box-wrap">
    <Focusable
      onActivate={onActivate}
      onOKActionDescription="Set Image"
      onSecondaryActionDescription="View Details"
      className="image-wrap"
      style={{ paddingBottom: `${(width === height) ? 100 : (height / width * 100)}%` }}
      {...rest}
    >
      <LazyImage
        src={src}
        isVideo={isAnimated}
        scrollContainer={scrollContainer}
        marginOffset="80px"
        unloadWhenOutside
      />
    </Focusable>
    <div className="author">
      <LazyImage src={author.avatar} />
      <span>{author.name}</span>
    </div>
    <div className="chips">
      {notes && <span className="chip">
        <FooterGlyph button={2} type={0} size={0} /> {t('Notes')}
      </span>}
    </div>
  </div>
);

export default Asset;