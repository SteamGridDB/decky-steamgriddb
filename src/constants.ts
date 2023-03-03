import t from './utils/i18n';

export const ASSET_TYPE: Record<SGDBAssetType, eAssetType> = {
  grid_p: 0,
  grid_l: 3,
  hero: 1,
  logo: 2,
  icon: 4,
};

export const SGDB_ASSET_TYPE_READABLE: Record<SGDBAssetType, string> = {
  grid_p: t('ASSET_TYPE_CAPSULE', 'Capsule'),
  grid_l: t('ASSET_TYPE_WIDECAPSULE', 'Wide Capsule'),
  hero: t('ASSET_TYPE_HERO', 'Hero'),
  logo: t('ASSET_TYPE_LOGO', 'Logo'),
  icon: t('ASSET_TYPE_ICON', 'Icon'),
};

const gridStyles = {
  options: [
    { label: 'Alternate', value: 'alternate' },
    { label: 'White Logo', value: 'white_logo' },
    { label: 'No Logo', value: 'no_logo' },
    { label: 'Blurred', value: 'blurred' },
    { label: 'Minimal', value: 'material' },
  ],
  default: ['alternate', 'white_logo', 'no_logo', 'blurred', 'material'],
};

export const STYLES = {
  grid_p: gridStyles,
  grid_l: gridStyles,
  hero: {
    options: [
      { label: 'Alternate', value: 'alternate' },
      { label: 'Blurred', value: 'blurred' },
      { label: 'Minimal', value: 'material' },
    ],
    default: ['alternate', 'blurred', 'material'],
  },
  logo: {
    options: [
      { label: 'Official', value: 'official' },
      { label: 'White', value: 'white' },
      { label: 'Black', value: 'black' },
      { label: 'Custom', value: 'custom' },
    ],
    default: ['official', 'white', 'black', 'custom'],
  },
  icon: {
    options: [
      { label: 'Official', value: 'official' },
      { label: 'Custom', value: 'custom' },
    ],
    default: ['official', 'custom'],
  },
};

const allMimes = {
  options: [
    { label: 'PNG', value: 'image/png' },
    { label: 'JPEG', value: 'image/jpeg' },
    { label: 'WebP', value: 'image/webp' },
  ],
  default: ['image/png', 'image/jpeg', 'image/webp'],
};

export const MIMES = {
  grid_p: allMimes,
  grid_l: allMimes,
  hero: allMimes,
  logo: {
    options: [
      { label: 'PNG', value: 'image/png' },
      { label: 'WebP', value: 'image/webp' },
    ],
    default: ['image/png', 'image/webp'],
  },
  icon: {
    options: [
      { label: 'PNG', value: 'image/png' },
      { label: 'ICO', value: 'image/vnd.microsoft.icon' },
    ],
    default: ['image/png', 'image/vnd.microsoft.icon'],
  },
};

const validIconSizes = [1024,768,512,310,256,194,192,180,160,152,150,144,128,120,114,100,96,90,80,76,72,64,60,57,56,54,48,40,35,32,28,24,20,16,14,10,8];

export const DIMENSIONS = {
  grid_p: {
    options: ['600x900', '342x482', '660x930', '512x512', '1024x1024'].map((x) => ({ label: x.replace('x', '×'), value: x })),
    default: ['600x900', '342x482', '660x930'],
  },
  grid_l: {
    options: ['460x215', '920x430', '512x512', '1024x1024'].map((x) => ({ label: x.replace('x', '×'), value: x })),
    default: ['460x215', '920x430'],
  },
  hero: {
    options: ['1920x620', '3840x1240', '1600x650'].map((x) => ({ label: x.replace('x', '×'), value: x })),
    default: ['1920x620', '3840x1240', '1600x650'],
  },
  logo: {
    options: [],
    default: [],
  },
  icon: {
    options: validIconSizes.map((x) => ({ label: `${x}×${x}`, value: x })),
    default: validIconSizes,
  },
};

// Sometimes tabs needs different translation strings
export const tabStrs: Record<SGDBAssetType | 'manage', string> = {
  grid_p: t('LABEL_TAB_CAPSULE', 'Capsule'),
  grid_l: t('LABEL_TAB_WIDECAPSULE', 'Wide Capsule'),
  hero: t('LABEL_TAB_HERO', 'Hero'),
  logo: t('LABEL_TAB_LOGO', 'Logo'),
  icon: t('LABEL_TAB_ICON', 'Icon'),
  manage: t('LABEL_TAB_MANAGE', 'Manage'),
};

// Default tab order
export const DEFAULT_TABS: SGDBAssetType[] | string[] = [
  ...Object.keys(tabStrs),
];