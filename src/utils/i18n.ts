import * as de from '../i18n/de.json';
import * as el from '../i18n/el.json';
import * as es from '../i18n/es.json';
import * as es419 from '../i18n/es-419.json';
import * as ja from '../i18n/ja.json';
import * as pt from '../i18n/pt.json';
import * as ro from '../i18n/ro.json';
import * as ru from '../i18n/ru.json';
import * as sv from '../i18n/sv.json';

export const LANGS = {
  de: {
    name: 'Deutsch',
    strings: de,
    credit: ['Kurikuo']
  },
  el: {
    name: 'Ελληνικά',
    strings: el,
    credit: ['Emenesu']
  },
  es: {
    name: 'Español-España',
    strings: es,
    credit: ['Andrea Laguillo', 'Kam']
  },
  'es-419': {
    name: 'Español-Latinoamérica',
    strings: es419,
    credit: ['Kam']
  },
  ja: {
    name: '日本語',
    strings: ja,
    credit: ['Nes']
  },
  pt: {
    name: 'Português',
    strings: pt,
    credit: ['Kokasgui']
  },
  ro: {
    name: 'Română',
    strings: ro,
    credit: ['Munt']
  },
  ru: {
    name: 'Русский',
    strings: ru,
    credit: []
  },
  sv: {
    name: 'Svenska',
    strings: sv,
    credit: ['Moneyman Dan']
  },
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
//  th: {
//    name: 'ไทย',
//    strings: th,
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
  //  tr: {
  //    name: 'Türkçe',
  //    strings: tr,
  //    credit: []
  //  },
  //  'pt-br': {
  //    name: 'Português-Brasil',
  //    strings: ptBr,
  //    credit: []
  //  },
  //  bg: {
  //    name: 'български език',
  //    strings: bg,
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
 * @param {string} key Locale key
 * @param {string} originalString Original text
 * @param {boolean} steamToken If true, uses the key to query Steams token store.
 *    Good for actions like "Back" or "Cancel". Won't be dumped with the rest of the strings.
 * 
 * @example
 * t('TITLE_FILTER_MODAL', 'Asset Filters')
 * @example
 * // if you need variables use .replace()  
 * t('ACTION_REMOVE_GAME', 'Delete {gameName}').replaceAll('{gameName}', gameName)
 * @example
 * // Original Steam string
 * t('Button_Back', 'Back', true);
 */
const trans_string = (key: string, originalString: string, steamToken = false): string => {
  const lang = getCurrentLanguage();
  if (steamToken) {
    return window.LocalizationManager.m_mapTokens.get(key) ?? window.LocalizationManager.m_mapFallbackTokens.get(key) ?? originalString;
  }
  if (lang === 'en') return originalString;

  return LANGS[lang]?.strings?.[key] ?? originalString;
};

// using "trans_string" so it can be found by dump-strings
export default trans_string;
