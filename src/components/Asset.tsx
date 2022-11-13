import { VFC } from 'react';
import { Focusable, FocusableProps, FooterLegendProps } from 'decky-frontend-lib';
import { LazyImage } from './LazyImage';

interface AssetProps extends FooterLegendProps {
  width: number;
  height: number;
  src: string;
  onActivate?: FocusableProps['onActivate'];
}

const Asset: VFC<AssetProps> = ({ width, height, src, onActivate, ...rest }) => (
  <div className="image-box-wrap">
    <Focusable
      onActivate={onActivate}
      onOKActionDescription="Set Image"
      onSecondaryActionDescription="View Details"
      className="image-wrap"
      style={{ paddingBottom: `${height / width * 100}%` }}
      {...rest}
    >
      <LazyImage src={src} />
    </Focusable>
  </div>
);

export default Asset;