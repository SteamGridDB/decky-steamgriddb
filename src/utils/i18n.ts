import * as cs from '../i18n/cs.json';
import * as de from '../i18n/de.json';
import * as el from '../i18n/el.json';
import * as es from '../i18n/es.json';
import * as es419 from '../i18n/es-419.json';
import * as fr from '../i18n/fr.json';
import * as fi from '../i18n/fi.json';
import * as it from '../i18n/it.json';
import * as ja from '../i18n/ja.json';
import * as ko from '../i18n/ko.json';
import * as nl from '../i18n/nl.json';
import * as pl from '../i18n/pl.json';
import * as pt from '../i18n/pt.json';
import * as ptBr from '../i18n/pt-br.json';
import * as ro from '../i18n/ro.json';
import * as ru from '../i18n/ru.json';
import * as sv from '../i18n/sv.json';
import * as tr from '../i18n/tr.json';
import * as uk from '../i18n/uk.json';
import * as zhCn from '../i18n/zh-cn.json';
import * as zhTw from '../i18n/zh-tw.json';

const simplifiedChinese = {
  name: '简体中文',
  strings: zhCn,
  credit: ['zhzy0077'],
};

export const LANGS = {
  cs: {
    name: 'Čeština',
    strings: cs,
    credit: ['zenobit'],
  },
  de: {
    name: 'Deutsch',
    strings: de,
    credit: ['Kurikuo', 'benutzer_artur7', 'Anja', 'FL0W'],
  },
  fi: {
    name: 'Suomi',
    strings: fi,
    credit: ['Jage'],
  },
  el: {
    name: 'Ελληνικά',
    strings: el,
    credit: ['Emenesu'],
  },
  es: {
    name: 'Español-España',
    strings: es,
    credit: ['Andrea Laguillo', 'Kam', 'm0uch0'],
  },
  'es-419': {
    name: 'Español-Latinoamérica',
    strings: es419,
    credit: ['Kam'],
  },
  fr: {
    name: 'Français',
    strings: fr,
    credit: ['Michael Jean'],
  },
  it: {
    name: 'Italiano',
    strings: it,
    credit: ['SpagottoB37', 'RodoMa92'],
  },
  ja: {
    name: '日本語',
    strings: ja,
    credit: ['Nes'],
  },
  ko: {
    name: '한국어',
    strings: ko,
    credit: ['yor42'],
  },
  nl: {
    name: 'Nederlands',
    strings: nl,
    credit: ['Phanpy100 (Fanny)', 'Jannes Verlinde'],
  },
  pl: {
    name: 'Polski',
    strings: pl,
    credit: ['DRS', 'Michał Kwiatkowski'],
  },
  pt: {
    name: 'Português',
    strings: pt,
    credit: ['Kokasgui', 'Ev1lbl0w'],
  },
  'pt-br': {
    name: 'Português-Brasil',
    strings: ptBr,
    credit: ['Oregano', 'Thomas Eric'],
  },
  ro: {
    name: 'Română',
    strings: ro,
    credit: ['Munt'],
  },
  ru: {
    name: 'Русский',
    strings: ru,
    credit: ['fycher', 'LostHikking'],
  },
  sv: {
    name: 'Svenska',
    strings: sv,
    credit: ['Moneyman Dan', 'Super'],
  },
  tr: {
    name: 'Türkçe',
    strings: tr,
    credit: ['Bilgehan Ceviz'],
  },
  uk: {
    name: 'Українська',
    strings: uk,
    credit: ['Veydzher'],
  },
  'zh-cn': simplifiedChinese,
  'sc-sc': simplifiedChinese, // sc-sc is "SteamChina" i think?, it's mapped to zh-cn in the client so doing the same here.
  'zh-tw': {
    name: '正體中文',
    strings: zhTw,
    credit: ['mingyc'],
  },
//  th: {
//    name: 'ไทย',
//    strings: th,
//    credit: []
//  },
//  da: {
//    name: 'Dansk',
//    strings: da,
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
//  vn: {
//    name: 'Tiếng Việt',
//    strings: vn,
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
