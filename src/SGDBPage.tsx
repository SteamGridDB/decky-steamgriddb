import {
  ButtonItem,
  DialogButtonProps,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Toggle,
  Router,
  ServerAPI,
  quickAccessMenuClasses,
  useParams,
  ToggleField,
  MenuItem,
  Button,
  DialogButton,
  DialogControlsSection,
} from 'decky-frontend-lib';
import { VFC } from 'react';

const SGDBPage: VFC = () => {
  const { appid, appdetails } = useParams<{ appid: string, appdetails: string }>();
  const details: SGDBPageAppDetails = JSON.parse(window.atob(decodeURIComponent(appdetails)));
  console.log(details);
  return (
    <div style={{ marginTop: '50px', color: 'white' }}>
      Assets for {details.gameName} ({appid})
      <br />
      {JSON.stringify(details)}
    </div>
  );
};

export default SGDBPage;