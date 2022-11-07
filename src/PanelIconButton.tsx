import {
  DialogButtonProps,
  PanelSectionRow,
  DialogButton,
} from 'decky-frontend-lib';
import { FC, ReactNode } from 'react';

interface PanelIconButtonProps extends DialogButtonProps {
  icon: ReactNode;
  align?: 'left' | 'right';
}

/**
 * Panel row with a button next to an icon.
 */
const PanelIconButton: FC<PanelIconButtonProps> = ({ icon, align = 'left', children, ...rest }) => (
  <PanelSectionRow>
    <div style={{
      display: 'flex',
      padding: '.5em 0',
      gap: '1em',
      alignItems: 'center',
      flexDirection: align === 'left' ? undefined : 'row-reverse'
    }}>
      <div
        style={{
          display: 'flex',
          fontSize: '1.5em',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <DialogButton {...rest}>
        {children}
      </DialogButton>
    </div>
  </PanelSectionRow>
);

export default PanelIconButton;