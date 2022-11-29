export const LANGS = {
//  de: {
//    name: 'Deutsch',
//    strings: de,
//    credit: []
//  },
//  fr: {
//    name: 'Français',
//    strings: fr,
//    credit: []
//  },
//  it: {
//    name: 'Italiano',
//    strings: it,
//    credit: []
//  },
//  ko: {
//    name: '한국어',
//    strings: ko,
//    credit: []
//  },
//  es: {
//    name: 'Español-Mexicano',
//    strings: es,
//    credit: []
//  },
//  'zh-cn': {
//    name: '简体中文',
//    strings: zhCn,
//    credit: []
//  },
//  'zh-tw': {
//    name: '繁體中文',
//    strings: zhTw,
//    credit: []
//  },
//  ru: {
//    name: 'Русский',
//    strings: ru,
//    credit: []
//  },
//  th: {
//    name: 'ไทย',
//    strings: th,
//    credit: []
//  },
//  ja: {
//    name: '日本語',
//    strings: ja,
//    credit: []
//  },
//  pt: {
//    name: 'Português',
//    strings: pt,
//    credit: []
//  },
//  pl: {
//    name: 'Polski',
//    strings: pl,
//    credit: []
//  },
//  da: {
//    name: 'Dansk',
//    strings: da,
//    credit: []
//  },
//  nl: {
//    name: 'Nederlands',
//    strings: nl,
//    credit: []
//  },
//  fi: {
//    name: 'Suomi',
//    strings: fi,
//    credit: []
//  },
//  no: {
//    name: 'Norsk',
//    strings: no,
//    credit: []
//  },
//  sv: {
//    name: 'Svenska',
//    strings: sv,
//    credit: []
//  },
//  hu: {
//    name: 'Magyar',
//    strings: hu,
//    credit: []
//  },
//  cs: {
//    name: 'Čeština',
//    strings: cs,
//    credit: []
//  },
//  ro: {
//    name: 'Română',
//    strings: ro,
//    credit: []
//  },
//  tr: {
//    name: 'Türkçe',
//    strings: tr,
//    credit: []
//  },
//  ar: {
//    name: 'العربية',
//    strings: ar,
//    credit: []
//  },
//  'pt-br': {
//    name: 'Português-Brasil',
//    strings: ptBr,
//    credit: []
//  },
//  bg: {
//    name: 'Български',
//    strings: bg,
//    credit: []
//  },
//  el: {
//    name: 'Ελληνικά',
//    strings: el,
//    credit: []
//  },
//  en: {
//    name: 'English',
//    strings: en,
//    credit: []
//  }
//  uk: {
//    name: 'Українська',
//    strings: uk,
//    credit: []
//  },
//  'es-419': {
//    name: 'Español-Latinoamérica',
//    strings: es419,
//    credit: []
//  },
//  vn: {
//    name: 'Tiếng Việt',
//    strings: vn,
//    credit: []
//  },
//  'sc-sc': { // should be same as zh-cn
//    name: '简体中文',
//    strings: scSc,
//    credit: []
//  },
};

let cachedLang: string | undefined;
const getCurrentLanguage = (): string => {
  if (cachedLang) return cachedLang;

  // @ts-ignore: LocalizationManager always exists
  const lang = window.LocalizationManager.m_rgLocalesToUse[0];
  cachedLang = lang;
  return lang;
};

export const getCredits = (lang?: string) => {
  if (lang) return LANGS[lang]?.credit;
  return LANGS[getCurrentLanguage()]?.credit;
};

export const getLanguageName = (lang?: string): string => {
  if (lang) return LANGS[lang]?.name;
  return LANGS[getCurrentLanguage()]?.name;
};

/**
 * Very basic translation cause theres like 20 strings and i don't need anything more complex.
 * 
 * @example
 * t('original string')
 * @example
 * // if you need variables use .replace()  
 * t('Delete {gameName}').replace(/{gameName}/g, gameName)
 * @example
 * // translated variables, make sure var is translated elsewhere
 * const assetTypes = {
 *  grid: t('Grid'),
 *  logo: t('Logo'),
 *  icon: t('Icon')
 * };
 * t('{assetType} has been successfully applied!')
 *   .replace('{assetType}', t(assetTypes[assetType]))
 */
const trans_string = (text: string): string => {
  const lang = getCurrentLanguage();
  if (lang === 'en') return text;

  return LANGS[lang]?.strings?.[text] ?? text;
};

// using "trans_string" so it can be found by dump-strings
export default trans_string;
