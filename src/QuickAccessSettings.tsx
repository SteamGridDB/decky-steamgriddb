import {
  PanelSection,
  PanelSectionRow,
  Navigation,
  ServerAPI,
  Field,
  showModal,
  ModalRoot,
  DialogButton,
  DialogBody,
  DialogHeader,
  DialogBodyText,
} from 'decky-frontend-lib';
import { useState, useEffect, VFC } from 'react';
import {
  SiPatreon,
  SiGithub,
  SiDiscord,
  SiTwitter,
  SiCrowdin,
  SiMastodon,
} from 'react-icons/si';

import BoopIcon from './components/Icons/BoopIcon';
import PanelSocialButton from './components/PanelSocialButton';
import t, { getCredits } from './utils/i18n';
import GuideVideoField from './GuideVideoField';
import openFilePicker from './utils/openFilePicker';
import TabSorter from './components/TabSorter';
import useSettings, { SettingsProvider } from './hooks/useSettings';

const tabSettingsDesc = t('MSG_ASSET_TAB_SETTINGS_DESC', 'Reorder or hide unused tabs, and set the default tab that opens when using "{ACTION_CHANGE_ARTWORK}"'.replace('{ACTION_CHANGE_ARTWORK}', t('ACTION_CHANGE_ARTWORK', 'Change artwork...')));

const QuickAccessSettings: VFC<{ serverApi: ServerAPI }> = ({ serverApi }) => {
  const { get } = useSettings();
  const [useCount, setUseCount] = useState<number | null>(null);
  const [debugAppid] = useState('70');

  useEffect(() => {
    (async () => {
      setUseCount(await get('plugin_use_count', 0));
    })();
  }, [get]);

  if (useCount === null) return null;

  return (
    <>
      {process.env.ROLLUP_ENV === 'development' && (
        <PanelSection title="Debug">
          <PanelSectionRow>
            <Field
              padding="none"
              childrenContainerWidth="max"
            >
              <DialogButton onClick={() => {
                Navigation.Navigate('/zoo');
                Navigation.CloseSideMenus();
              }}
              >
              Zoo
              </DialogButton>
              <DialogButton onClick={() => {
                Navigation.Navigate(`/steamgriddb/${debugAppid}/manage`);
                Navigation.CloseSideMenus();
              }}
              >
                {debugAppid}
              </DialogButton>
              <DialogButton onClick={() => {
                Navigation.Navigate('/steamgriddb/1091500/manage');
                Navigation.CloseSideMenus();
              }}
              >
              1091500
              </DialogButton>
              <DialogButton onClick={() => {
                openFilePicker('/home/manjaro', true, undefined, {}, serverApi);
              }}
              >
              file picker
              </DialogButton>
            </Field>
          </PanelSectionRow>
        </PanelSection>
      )}
      {(useCount <= 5) && ( // Hide tutorial if plugin has been used more than 5 times
        <PanelSection title={t('LABEL_USAGE_TITLE', 'Lost? Here\'s a Quick Guide')}>
          <PanelSectionRow>
            <GuideVideoField
              bottomSeparator="standard"
              highlightOnFocus
              focusable
              onActivate={() => {
                showModal(
                  <ModalRoot>
                    <DialogBody style={{ padding: '0 3.5em' }}>
                      <GuideVideoField />
                    </DialogBody>
                  </ModalRoot>
                );
              }}
            />
          </PanelSectionRow>
        </PanelSection>
      )}
      <PanelSection title={t('Settings', 'Settings', true)}>
        <PanelSectionRow>
          <Field childrenLayout="below" description={tabSettingsDesc}>
            <DialogButton
              onClick={() => {
                showModal((
                  <ModalRoot>
                    <SettingsProvider serverApi={serverApi}>
                      <DialogHeader>
                        {t('LABEL_SETTINGS_ASSET_TABS', 'Asset Tab Settings')}
                      </DialogHeader>
                      <DialogBodyText>{tabSettingsDesc}</DialogBodyText>
                      <DialogBody>
                        <TabSorter />
                      </DialogBody>
                    </SettingsProvider>
                  </ModalRoot>
                ));
              }}
            >
              {t('LABEL_SETTINGS_ASSET_TABS', 'Asset Tab Settings')}
            </DialogButton>
          </Field>
        </PanelSectionRow>
      </PanelSection>
      {getCredits() && (
        <PanelSection title={t('LABEL_TRANSLATION_CREDIT_TITLE', 'English Translation')}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '.25em',
          }}
          >
            {getCredits().map((person: any) => <span key={person}>{person}</span>)}
          </div>
        </PanelSection>
      )}
      <PanelSection title={t('LABEL_MORE_SGDB_TITLE', 'More SteamGridDB Stuff')}>
        <PanelSocialButton
          icon={<SiDiscord fill="#5865F2" />}
          url="https://discord.gg/bnSVJrz"
        >
          {t('ACTION_SGDB_DISCORD', 'Join the Discord')}
        </PanelSocialButton>
        <PanelSocialButton
          icon={<SiGithub />}
          url="https://github.com/SteamGridDB/"
        >
          {t('ACTION_SGDB_GITHUB', 'Open Source Projects')}
        </PanelSocialButton>
        <PanelSocialButton
          icon={<SiPatreon fill="#FF424D" />}
          url="https://www.patreon.com/steamgriddb"
        >
          {t('ACTION_SGDB_DONATE', 'Support us on Patreon')}
        </PanelSocialButton>
        <PanelSocialButton
          icon={<SiCrowdin fill="#fff" />} // actual branding is #2E3340 but it's too dark
          url="https://crowdin.com/project/decky-steamgriddb"
        >
          {t('ACTION_SGDB_TRANSLATE', 'Help Translate')}
        </PanelSocialButton>
        <PanelSocialButton
          icon={<BoopIcon fill="#4e9ac6" />}
          url="https://www.steamgriddb.com/boop"
        >
          {t('ACTION_SGDB_BOOP', 'Check out SGDBoop')}
        </PanelSocialButton>
        <PanelSocialButton
          icon={<SiTwitter fill="#1DA1F2" />}
          url="https://twitter.com/SteamGridDB"
        >
          Twitter
        </PanelSocialButton>
        <PanelSocialButton
          icon={<SiMastodon fill="#6364FF" />}
          url="https://mastodon.gamedev.place/@SteamGridDB"
        >
          Mastodon
        </PanelSocialButton>
      </PanelSection>
    </>
  );
};

export default QuickAccessSettings;