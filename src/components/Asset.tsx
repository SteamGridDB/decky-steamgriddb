import { VFC } from 'react';
import { Focusable, FocusableProps, FooterLegendProps } from 'decky-frontend-lib';
import { LazyImage } from './LazyImage';

interface AssetProps extends FooterLegendProps {
  width: number;
  height: number;
  src: string;
  isAnimated: boolean;
  onActivate?: FocusableProps['onActivate'];
}

const Asset: VFC<AssetProps> = ({ width, height, src, isAnimated, onActivate, ...rest }) => (
  <div className="image-box-wrap">
    <Focusable
      onActivate={onActivate}
      onOKActionDescription="Set Image"
      onSecondaryActionDescription="View Details"
      className="image-wrap"
      style={{ paddingBottom: `${(width === height) ? 100 : (height / width * 100)}%` }}
      {...rest}
    >
      <LazyImage src={src} isVideo={isAnimated} />
    </Focusable>
  </div>
);

export default Asset;