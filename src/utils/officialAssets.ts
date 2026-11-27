import SteamLang from './steam-api-language-map';

type SteamAssetImages = {
  image: { [language: string]: string };
  image2x?: { [language: string]: string };
};

type SteamMetadata = {
  store_asset_mtime: number | null;
  clienticon: string | null;
  header_image_full?: { [language: string]: string } | null;
  library_capsule_full?: SteamAssetImages | null;
  library_hero_full?: SteamAssetImages | null;
  library_logo_full?: SteamAssetImages | null;
};

export type SteamExternalData = {
  steam?: Array<{
    id: string;
    metadata: SteamMetadata;
  }>;
};

export type OfficialAssetSource = {
  assetType: SGDBAssetType;
  languages: string[];
  defaultLanguage: string;
  getUrl: (language: string) => string;
  getUrl2x?: (language: string) => string | undefined;
};

const getDefaultLanguage = (languages: string[]) => {
  const english = SteamLang('en', 'webapi', 'api') as string | null;
  return english && languages.includes(english) ? english : languages[0];
};

const getSteamAssetBase = (appId: string) => (
  `https://shared.steamstatic.com/store_item_assets/steam/apps/${appId}`
);

const getSteamAssetUrl = (base: string, fileName: string, mtime: number | null) => (
  `${base}/${fileName}?t=${mtime}`
);

const makeImageAssetSource = (
  assetType: SGDBAssetType,
  data: SteamAssetImages | null | undefined,
  base: string,
  mtime: number | null
): OfficialAssetSource | null => {
  if (!data?.image) return null;

  const languages = Object.keys(data.image);
  if (languages.length === 0) return null;

  const has2x = Boolean(data.image2x);

  return {
    assetType,
    languages,
    defaultLanguage: getDefaultLanguage(languages),
    getUrl: (language) => getSteamAssetUrl(base, data.image[language], mtime),
    getUrl2x: has2x ? (language) => {
      const fileName = data.image2x?.[language];
      return fileName ? getSteamAssetUrl(base, fileName, mtime) : undefined;
    } : undefined,
  };
};

/**
 * Build the list of official Steam assets available for a game.
 *
 * @param externalData `external_platform_data` returned by the SteamGridDB API
 * @param options.allowIcon Set to false for mods and non-local shortcuts, where Steam icons cannot be edited
 */
const getOfficialAssetSources = (
  externalData: SteamExternalData | null | undefined,
  options: { allowIcon?: boolean } = {}
): OfficialAssetSource[] => {
  const { allowIcon = true } = options;
  const steam = externalData?.steam?.[0];
  if (!steam?.metadata) return [];

  const { id, metadata } = steam;
  const base = getSteamAssetBase(id);
  const sources: Array<OfficialAssetSource | null> = [];
  const headerImages = metadata.header_image_full;

  if (headerImages) {
    const languages = Object.keys(headerImages);
    if (languages.length > 0) {
      sources.push({
        assetType: 'grid_l',
        languages,
        defaultLanguage: getDefaultLanguage(languages),
        getUrl: (language) => getSteamAssetUrl(base, headerImages[language], metadata.store_asset_mtime),
        getUrl2x: (language) => getSteamAssetUrl(
          base,
          headerImages[language].replace(/\.jpg$/, '_2x.jpg'),
          metadata.store_asset_mtime
        ),
      });
    }
  }

  sources.push(
    makeImageAssetSource('grid_p', metadata.library_capsule_full, base, metadata.store_asset_mtime),
    makeImageAssetSource('hero', metadata.library_hero_full, base, metadata.store_asset_mtime),
    makeImageAssetSource('logo', metadata.library_logo_full, base, metadata.store_asset_mtime)
  );

  if (allowIcon && metadata.clienticon) {
    sources.push({
      assetType: 'icon',
      languages: ['English'],
      defaultLanguage: 'English',
      getUrl: () => `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${id}/${metadata.clienticon}.ico`,
    });
  }

  // Keep a stable, user-facing order instead of metadata object order.
  const assetOrder: SGDBAssetType[] = ['grid_p', 'grid_l', 'hero', 'logo', 'icon'];
  return sources
    .filter((source): source is OfficialAssetSource => source !== null)
    .sort((a, b) => assetOrder.indexOf(a.assetType) - assetOrder.indexOf(b.assetType));
};

export const getOfficialAssetUrls = (source: OfficialAssetSource) => {
  const urls: string[] = [];
  const highRes = source.getUrl2x?.(source.defaultLanguage);
  if (highRes) urls.push(highRes);

  const standard = source.getUrl(source.defaultLanguage);
  if (!urls.includes(standard)) urls.push(standard);

  return urls;
};

export const getOfficialAssetSource = (
  externalData: SteamExternalData | null | undefined,
  assetType: SGDBAssetType,
  options: { allowIcon?: boolean } = {}
) => getOfficialAssetSources(externalData, options).find(
  (source) => source.assetType === assetType
);

export const hasOfficialAssetSource = (
  externalData: SteamExternalData | null | undefined,
  assetType: SGDBAssetType,
  options: { allowIcon?: boolean } = {}
) => Boolean(getOfficialAssetSource(externalData, assetType, options));

export default getOfficialAssetSources;
