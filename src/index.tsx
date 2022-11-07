import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  quickAccessMenuClasses,
  ToggleField,
} from 'decky-frontend-lib';
import { VFC } from 'react';
import { SiPatreon, SiGithub, SiDiscord, SiTwitter } from 'react-icons/si';
import BoopIcon from './BoopIcon';

import MenuIcon from './MenuIcon';
import PanelIconButton from './PanelIconButton';
import patchLibraryAppPage from './patchLibraryAppPage';
import SGDBPage from './SGDBPage';

// interface AddMethodArgs {
//   left: number;
//   right: number;
// }


const Content: VFC<{ serverAPI: ServerAPI }> = () => {
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
    <PanelSection title="Button Visibility">
      Select where you want the &quot;Change artwork...&quot; button to show up. (wip)
      <PanelSectionRow>
        <ToggleField
          label="Manage Popup"
          checked={true}
          disabled
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label="Game Properties"
          checked={false}
          disabled
        />
      </PanelSectionRow>
    </PanelSection>
    <PanelSection title="More SteamGridDB">
      <PanelIconButton
        icon={<SiDiscord fill="#5865F2" />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://discord.gg/invite/steamgriddb-488621078302949377');
        }}
      >
        Join the Discord
      </PanelIconButton>
      <PanelIconButton
        icon={<BoopIcon fill="#4e9ac6" />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://www.steamgriddb.com/boop');
        }}
      >
        Check out SGDBoop
      </PanelIconButton>
      <PanelIconButton
        icon={<SiGithub />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://github.com/SteamGridDB/');
        }}
      >
        Open Source Projects
      </PanelIconButton>
      <PanelIconButton
        icon={<SiPatreon fill="#FF424D" />}
        onClick={() => {
          Router.CloseSideMenus();
          Router.NavigateToExternalWeb('https://www.patreon.com/steamgriddb');
        }}
      >
        Support us on Patreon
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

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute('/steamgriddb/:appid/:appdetails', SGDBPage, {
    exact: true,
  });

  const appPagePath = patchLibraryAppPage(serverApi);

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <MenuIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute('/steamgriddb/:appid/:appdetails');
      serverApi.routerHook.removePatch('/library/app/:appid', appPagePath);
    },
  };
});
