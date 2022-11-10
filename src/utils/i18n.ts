import log from './log';

// import * as gr from '../i18n/gr.json';

const langs = {
//  'de': de,
//  'fr': fr,
//  'it': it,
//  'ko': ko,
//  'es': es,
//  'zh-cn': zhCn,
//  'zh-tw': zhTw,
//  'ru': ru,
//  'th': th,
//  'ja': ja,
//  'pt': pt,
//  'pl': pl,
//  'da': da,
//  'nl': nl,
//  'fi': fi,
//  'no': no,
//  'sv': sv,
//  'hu': hu,
//  'cs': cs,
//  'ro': ro,
//  'tr': tr,
//  'ar': ar,
//  'pt-br': ptBr,
//  'bg': bg,
//  'el': el,
//  'uk': uk,
//  'es-419': es419,
//  'vn': vn,
//  'sc-sc': scSc,
};

export default (text: string) => {
  // @ts-ignore
  const lang = window.LocalizationManager.m_rgLocalesToUse[0];
  if (lang === 'en') return text;

  const str = langs[lang]?.[text];
  if (str) {
    return str;
  } else {
    log('Untranslated text:', lang, text);
    return text;
  }
};
