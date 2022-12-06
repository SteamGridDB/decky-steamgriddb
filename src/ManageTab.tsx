import { FC, useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { DialogButton, DialogLabel, DialogSubHeader, Focusable, joinClassNames, SteamAppOverview, UpdaterFieldClasses } from 'decky-frontend-lib';
import useSGDB from './hooks/useSGDB';
import log from './utils/log';
import t from './utils/i18n';

import LibraryImage from './components/LibraryImage';

/*
  Don't match hidden files and only match directories and specific file extensions.
  Credit goes to SirMangler for this beast.

  Tests: https://regex101.com/r/2EeIqZ/1
*/
const imagesExpr = /(?<!.)(.*)\.(jpe?g|a?png|webp|gif)$|(?<!.)([^.]|.*\\)+(?!.)/gi;

const ImgWithFallback: FC<{ srcs: string[] } & ImgHTMLAttributes<HTMLImageElement>> = ({ srcs, ...props }) => {
  const [source, setSource] = useState<string | undefined>(srcs[0]);
  const imgRef = useRef<HTMLImageElement>(null);
  const srcIndex = useRef(0);

  useEffect(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const onError = () => {
      srcIndex.current++;
      if (srcIndex.current >= srcs.length) {
        img.removeEventListener('error', onError);
        return;
      }
      setSource(srcs[srcIndex.current]);
    };

    img.addEventListener('error', onError);
    return () => {
      img.removeEventListener('error', onError);
    };
  }, [srcs]);

  return <img {...props} src={source} ref={imgRef} />;
};

const AssetBlock: FC<{
  label: string,
  app: SteamAppOverview,
  eAssetType: eAssetType
}> = ({ label, app, eAssetType }) => <div className={joinClassNames('asset-wrap', `asset-type-${eAssetType}`)}>
  <div className="asset-label">{label}</div>
  <Focusable onActivate={() => {}}>
    <LibraryImage
      app={app}
      eAssetType={eAssetType}
      allowCustomization={false}
      neverShowTitle
      className="asset"
      imageClassName="asset-img"
    />
  </Focusable>
</div>;

const LocalTab: FC = () => {
  const { appId, serverApi, appOverview } = useSGDB();
  const [startPath, setStartPath] = useState('/');

  const openPicker = async () => {
    const path = serverApi.openFilePicker(startPath, true, imagesExpr);
    log(path);
  };

  useEffect(() => {
    (async () => {
      if (appId) {
        console.log(appOverview);
      }
      const path = (await serverApi.callPluginMethod('get_local_start', {})).result;
      setStartPath(path);
    })();
  }, [appId, appOverview, serverApi]);

  return <Focusable id="local-images-container">
    <Focusable flow-children="right" style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <AssetBlock eAssetType={0} app={appOverview} label={t('Current Capsule')} />
      <AssetBlock eAssetType={4} app={appOverview} label={t('Current Icon')} />
    </Focusable>
    <Focusable flow-children="right" style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      <AssetBlock eAssetType={3} app={appOverview} label={t('Current Wide Capsule')} />
      <AssetBlock eAssetType={2} app={appOverview} label={t('Current Logo')} />
    </Focusable>
    <div style={{ gridColumn: 'span 2' }}>
      <AssetBlock eAssetType={1} app={appOverview} label={t('Current Hero')} />
    </div>
  </Focusable>;
};

export default LocalTab;
