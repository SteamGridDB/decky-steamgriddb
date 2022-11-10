import { VFC } from 'react';
import { SuspensefulImage, Focusable, FocusableProps, FooterLegendProps } from 'decky-frontend-lib';

interface AssetImageProps extends FooterLegendProps {
  width: number;
  height: number;
  src: string;
  onActivate?: FocusableProps['onActivate'];
}

const AssetImage: VFC<AssetImageProps> = ({ width, height, src, onActivate, ...rest }) => (
  <Focusable
    onActivate={onActivate}
    onOKActionDescription="Set Image"
    onSecondaryActionDescription="View Details"
    className="image-wrap"
    style={{ paddingBottom: `${height / width * 100}%` }}
    {...rest}
  >
    <SuspensefulImage src={src} />
  </Focusable>
);

export default AssetImage;