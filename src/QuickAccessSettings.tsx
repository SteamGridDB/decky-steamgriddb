import {
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  Field,
  DialogButton,
  ToggleField,
  Button,
} from 'decky-frontend-lib';
import { Fragment, useState, VFC } from 'react';
import { SiPatreon, SiGithub, SiDiscord, SiTwitter } from 'react-icons/si';
import BoopIcon from './components/BoopIcon';

import PanelIconButton from './components/PanelIconButton';
import t, { getCredits } from './utils/i18n';

const QuickAccessSettings: VFC<{ serverAPI: ServerAPI }> = () => {
  const [debugAppid, setDebugAppid] = useState('220');
  // const [result, setResult] = useState<number | undefined>();

  // const onClick = async () => {
  //   const result = await serverAPI.callPluginMethod<AddMethodArgs, number>(
  //     "add",
  //     {
  //       left: 2,
  //       right: 2,
  //     }
  //   );
  //   if (result.success) {
  //     setResult(result.result);
  //   }
  // };

  return (<>
    {process.env.ROLLUP_ENV === 'development' && (
      <PanelSection title="Debug">
        <PanelSectionRow>
          <Field>
            <Button onClick={() => {
              Router.Navigate(`/steamgriddb/${debugAppid}`);
              Router.CloseSideMenus();
            }}>
              220
            </Button>
            <Button onClick={() => {
              Router.Navigate('/steamgriddb/1091500');
              Router.CloseSideMenus();
            }}>
              1091500
            </Button>
          </Field>
        </PanelSectionRow>
      </PanelSection>
    )}
    <PanelSection title={t('Button Visibility')}>
      {t('Select where you want the "Change artwork..." button to show up.')}
      <PanelSectionRow>
        <ToggleField
          label={t('Game Options')}
          checked={true}
          disabled
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t('Manage Submenu')}
          checked={false}
          disabled
        />
      </PanelSectionRow>
    </PanelSection>
    {getCredits() && <PanelSection title={t('Translated By')}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '.25em'
      }}>
        {getCredits().map((person: any) => <span key={person}>{person}</span>)}
      </div>
    </PanelSection>}
    <PanelSection title={t('More SteamGridDB Stuff')}>
      <PanelIconButton
        icon={<SiDiscord fill="#5865F2" />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://discord.steamgriddb.com');
        }}
      >
        {t('Join the Discord')}
      </PanelIconButton>
      <PanelIconButton
        icon={<SiGithub />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://github.com/SteamGridDB/');
        }}
      >
        {t('Open Source Projects')}
      </PanelIconButton>
      <PanelIconButton
        icon={<SiPatreon fill="#FF424D" />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://www.patreon.com/steamgriddb');
        }}
      >
        {t('Support us on Patreon')}
      </PanelIconButton>
      <PanelIconButton
        icon={<BoopIcon fill="#4e9ac6" />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://www.steamgriddb.com/boop');
        }}
      >
        {t('Check out SGDBoop')}
      </PanelIconButton>
      <PanelIconButton
        icon={<SiTwitter fill="#1DA1F2" />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://twitter.com/SteamGridDB');
        }}
      >
        lol twitter
      </PanelIconButton>
    </PanelSection>
  </>);
};

export default QuickAccessSettings;