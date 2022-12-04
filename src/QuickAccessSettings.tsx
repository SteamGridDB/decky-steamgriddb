import {
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  Field,
  DialogButton,
} from 'decky-frontend-lib';
import { useState, VFC } from 'react';
import { SiPatreon, SiGithub, SiDiscord, SiTwitter, SiCrowdin } from 'react-icons/si';
import BoopIcon from './components/Icons/BoopIcon';

import PanelSocialButton from './components/PanelSocialButton';
import t, { getCredits, getLanguageName } from './utils/i18n';

const QuickAccessSettings: VFC<{ serverAPI: ServerAPI }> = () => {
  const [debugAppid] = useState('220');
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
          <Field
            padding="none"
            childrenContainerWidth="max"
          >
            <DialogButton onClick={() => {
              Router.Navigate('/zoo');
              Router.CloseSideMenus();
            }}>
              Zoo
            </DialogButton>
            <DialogButton onClick={() => {
              Router.Navigate(`/steamgriddb/${debugAppid}`);
              Router.CloseSideMenus();
            }}>
              220
            </DialogButton>
            <DialogButton onClick={() => {
              Router.Navigate('/steamgriddb/1091500/hero');
              Router.CloseSideMenus();
            }}>
              1091500
            </DialogButton>
            <DialogButton onClick={() => {
              Router.Navigate('/steamgriddb/2194520584');
              Router.CloseSideMenus();
            }}>
              2194520584
            </DialogButton>
          </Field>
        </PanelSectionRow>
      </PanelSection>
    )}
    {getCredits() && <PanelSection title={t('{nativeLanguageName} Translation By').replace('{nativeLanguageName}', getLanguageName())}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '.25em'
      }}>
        {getCredits().map((person: any) => <span key={person}>{person}</span>)}
      </div>
    </PanelSection>}
    <PanelSection title={t('More SteamGridDB Stuff')}>
      <PanelSocialButton
        icon={<SiDiscord fill="#5865F2" />}
        url="https://discord.gg/bnSVJrz"
      >
        {t('Join the Discord')}
      </PanelSocialButton>
      <PanelSocialButton
        icon={<SiGithub />}
        url="https://github.com/SteamGridDB/"
      >
        {t('Open Source Projects')}
      </PanelSocialButton>
      <PanelSocialButton
        icon={<SiPatreon fill="#FF424D" />}
        url="https://www.patreon.com/steamgriddb"
      >
        {t('Support us on Patreon')}
      </PanelSocialButton>
      <PanelSocialButton
        icon={<SiCrowdin fill="#fff" />} // actual branding is #2E3340 but it's too dark
        url="https://crowdin.com/project/decky-steamgriddb"
      >
        {t('Help Translate')}
      </PanelSocialButton>
      <PanelSocialButton
        icon={<BoopIcon fill="#4e9ac6" />}
        url="https://www.steamgriddb.com/boop"
      >
        {t('Check out SGDBoop')}
      </PanelSocialButton>
      <PanelSocialButton
        icon={<SiTwitter fill="#1DA1F2" />}
        url="https://twitter.com/SteamGridDB"
      >
        lol twitter
      </PanelSocialButton>
    </PanelSection>
  </>);
};

export default QuickAccessSettings;