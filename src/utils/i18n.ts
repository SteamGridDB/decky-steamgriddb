import log from './log';

// import * as gr from '../i18n/gr.json';

export const LANGS = {
/*   de: {
    strings: de,
    credit: []
  },
  fr: {
    strings: fr,
    credit: []
  },
  it: {
    strings: it,
    credit: []
  },
  ko: {
    strings: ko,
    credit: []
  },
  es: {
    strings: es,
    credit: []
  },
  'zh-cn': {
    strings: zhCn,
    credit: []
  },
  'zh-tw': {
    strings: zhTw,
    credit: []
  },
  ru: {
    strings: ru,
    credit: []
  },
  th: {
    strings: th,
    credit: []
  },
  ja: {
    strings: ja,
    credit: []
  },
  pt: {
    strings: pt,
    credit: []
  },
  pl: {
    strings: pl,
    credit: []
  },
  da: {
    strings: da,
    credit: []
  },
  nl: {
    strings: nl,
    credit: []
  },
  fi: {
    strings: fi,
    credit: []
  },
  no: {
    strings: no,
    credit: []
  },
  sv: {
    strings: sv,
    credit: []
  },
  hu: {
    strings: hu,
    credit: []
  },
  cs: {
    strings: cs,
    credit: []
  },
  ro: {
    strings: ro,
    credit: []
  },
  tr: {
    strings: tr,
    credit: []
  },
  ar: {
    strings: ar,
    credit: []
  },
  'pt-br': {
    strings: ptBr,
    credit: []
  },
  bg: {
    strings: bg,
    credit: []
  },
  el: {
    strings: el,
    credit: []
  },
  uk: {
    strings: uk,
    credit: []
  },
  'es-419': {
    strings: es419,
    credit: []
  },
  vn: {
    strings: vn,
    credit: []
  },
  'sc-sc': {
    strings: scSc,
    credit: []
  }, */
};

const untranslated = {};

let cachedLang: string | undefined;
const getCurrentLanguage = (): string => {
  if (cachedLang) return cachedLang;

  // @ts-ignore: LocalizationManager always exists
  const lang = window.LocalizationManager.m_rgLocalesToUse[0];
  cachedLang = lang;
  return lang;
};

export default (text: string) => {
  const lang = getCurrentLanguage();
  if (lang === 'en') return text;

  const str = LANGS[lang]?.strings?.[text];
  if (str) {
    return str;
  } else {
    log('Untranslated text:', lang, text);
    // cheap dumping strat, store everything in a var and print to console
    if (process.env.ROLLUP_ENV === 'development') {
      untranslated[text] = text;
      log('FULL UNTRANSLATED OBJECT:', untranslated);
    }
    return text;
  }
};

export const getCredits = (lang?: string) => {
  if (lang) return LANGS[lang]?.credit;
  return LANGS[getCurrentLanguage()]?.credit;
};
