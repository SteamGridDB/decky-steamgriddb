export const LANGS = {
//  de: {
//    strings: de,
//    credit: []
//  },
//  fr: {
//    strings: fr,
//    credit: []
//  },
//  it: {
//    strings: it,
//    credit: []
//  },
//  ko: {
//    strings: ko,
//    credit: []
//  },
//  es: {
//    strings: es,
//    credit: []
//  },
//  'zh-cn': {
//    strings: zhCn,
//    credit: []
//  },
//  'zh-tw': {
//    strings: zhTw,
//    credit: []
//  },
//  ru: {
//    strings: ru,
//    credit: []
//  },
//  th: {
//    strings: th,
//    credit: []
//  },
//  ja: {
//    strings: ja,
//    credit: []
//  },
//  pt: {
//    strings: pt,
//    credit: []
//  },
//  pl: {
//    strings: pl,
//    credit: []
//  },
//  da: {
//    strings: da,
//    credit: []
//  },
//  nl: {
//    strings: nl,
//    credit: []
//  },
//  fi: {
//    strings: fi,
//    credit: []
//  },
//  no: {
//    strings: no,
//    credit: []
//  },
//  sv: {
//    strings: sv,
//    credit: []
//  },
//  hu: {
//    strings: hu,
//    credit: []
//  },
//  cs: {
//    strings: cs,
//    credit: []
//  },
//  ro: {
//    strings: ro,
//    credit: []
//  },
//  tr: {
//    strings: tr,
//    credit: []
//  },
//  ar: {
//    strings: ar,
//    credit: []
//  },
//  'pt-br': {
//    strings: ptBr,
//    credit: []
//  },
//  bg: {
//    strings: bg,
//    credit: []
//  },
//  el: {
//    strings: el,
//    credit: []
//  },
//  en: {
//    strings: en,
//    credit: []
//  }
//  uk: {
//    strings: uk,
//    credit: []
//  },
//  'es-419': {
//    strings: es419,
//    credit: []
//  },
//  vn: {
//    strings: vn,
//    credit: []
//  },
//  'sc-sc': { // should be same as zh-cn
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
const trans_string = (text: string) => {
  const lang = getCurrentLanguage();
  if (lang === 'en') return text;

  return LANGS[lang]?.strings?.[text] ?? text;
};

// using "trans_string" so it can be found by dump-strings
export default trans_string;
