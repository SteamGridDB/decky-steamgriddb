import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  quickAccessMenuClasses,
  useParams,
} from 'decky-frontend-lib';
import { VFC } from 'react';
import MenuIcon from './MenuIcon';
import patchLibraryAppPage from './patchLibraryAppPage';

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

  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        Section 1
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          Ayy
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate('/steamgriddb/220');
          }}
        >
          Go to /steamgriddb/220
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

const DeckyPluginRouterTest: VFC = () => {
  const { appid } = useParams<{ appid: string }>();
  console.log(window.location.search);
  return (
    <div style={{ marginTop: '50px', color: 'white' }}>
      SteamGridDB
      <br />
      test {appid}
      <br />
      {window.location.search}
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute('/steamgriddb/:appid', DeckyPluginRouterTest, {
    exact: true,
  });

  const myPatch = patchLibraryAppPage(serverApi);

  return {
    title: <div className={quickAccessMenuClasses.Title}>SteamGridDB</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <MenuIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute('/steamgriddb/:appid');
      serverApi.routerHook.removePatch('/library/app/:appid', myPatch);
    },
  };
});
