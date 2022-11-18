import { VFC } from 'react';
import { Focusable, FocusableProps, FooterLegendProps, joinClassNames } from 'decky-frontend-lib';
import { LazyImage } from './LazyImage';
import FooterGlyph from './FooterGlyph';
import t from '../utils/i18n';
import Chips from './Chips';
import Chip from './Chips/Chip';
import Spinner from '../../assets/spinner.svg';

interface AssetProps extends FooterLegendProps {
  assetType: SGDBAssetType;
  width: number;
  height: number;
  src: string;
  author: any;
  isAnimated: boolean;
  isDownloading: boolean;
  onActivate?: FocusableProps['onActivate'];
  scrollContainer?: Element;
  notes?: string;
}

const Asset: VFC<AssetProps> = ({
  assetType,
  width,
  height,
  src,
  author,
  isAnimated,
  onActivate,
  isDownloading = false,
  scrollContainer,
  notes = null,
  ...rest
}) => <div className="image-box-wrap">
  <Focusable
    onActivate={onActivate}
    onOKActionDescription={t('Set Image')}
    onSecondaryActionDescription={t('View Details')}
    className={joinClassNames('image-wrap', `type-${assetType}`)}
    style={{ paddingBottom: `${(width === height) ? 100 : (height / width * 100)}%` }}
    {...rest}
  >
    <div className={joinClassNames('dload-overlay', isDownloading ? 'downloading' : '')}><img src={Spinner} /></div>
    <Chips>
      {notes && <Chip color="#8a8a8a">
        <FooterGlyph button={2} type={0} size={0} /> {t('Notes')}
      </Chip>}
    </Chips>
    <LazyImage
      src={src}
      isVideo={isAnimated}
      scrollContainer={scrollContainer}
      wrapperProps={{
        className: 'thumb'
      }}
      marginOffset="80px"
      unloadWhenOutside
    />
  </Focusable>
  <div className="author">
    <LazyImage src={author.avatar} />
    <span>{author.name}</span>
  </div>
</div>;

export default Asset;