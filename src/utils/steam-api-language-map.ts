/**
 * Languages from official Steam docs
 * https://partner.steamgames.com/doc/store/localization/languages#supported_languages
(() => {
  const langs = [];
  const table = document.evaluate("//th[contains(text(),'English Name')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.closest('table');
  for (const row of table.rows) {
    if (row.cells[0].innerText !== 'English Name') {
      langs.push(Array.from(row.cells).map((x) => x.innerText.replace('*', '').trim()));
    }
  }

  // Create SteamChina from Simplified Chinese
  const zhXC = [...langs.find((x) => x[3] === 'zh-CN')];
  zhXC[2] = 'sc_schinese';
  zhXC[3] = 'zh-XC';
  langs.push(zhXC)

  console.info(`const LANGS = ${JSON.stringify(langs, null, 2)};`);
})();
 */
const LANGS = [
  [
    'Arabic',
    'العربية',
    'arabic',
    'ar',
  ],
  [
    'Bulgarian',
    'български език',
    'bulgarian',
    'bg',
  ],
  [
    'Chinese (Simplified)',
    '简体中文',
    'schinese',
    'zh-CN',
  ],
  [
    'Chinese (Traditional)',
    '繁體中文',
    'tchinese',
    'zh-TW',
  ],
  [
    'Czech',
    'čeština',
    'czech',
    'cs',
  ],
  [
    'Danish',
    'Dansk',
    'danish',
    'da',
  ],
  [
    'Dutch',
    'Nederlands',
    'dutch',
    'nl',
  ],
  [
    'English',
    'English',
    'english',
    'en',
  ],
  [
    'Finnish',
    'Suomi',
    'finnish',
    'fi',
  ],
  [
    'French',
    'Français',
    'french',
    'fr',
  ],
  [
    'German',
    'Deutsch',
    'german',
    'de',
  ],
  [
    'Greek',
    'Ελληνικά',
    'greek',
    'el',
  ],
  [
    'Hungarian',
    'Magyar',
    'hungarian',
    'hu',
  ],
  [
    'Italian',
    'Italiano',
    'italian',
    'it',
  ],
  [
    'Japanese',
    '日本語',
    'japanese',
    'ja',
  ],
  [
    'Korean',
    '한국어',
    'koreana',
    'ko',
  ],
  [
    'Norwegian',
    'Norsk',
    'norwegian',
    'no',
  ],
  [
    'Polish',
    'Polski',
    'polish',
    'pl',
  ],
  [
    'Portuguese',
    'Português',
    'portuguese',
    'pt',
  ],
  [
    'Portuguese-Brazil',
    'Português-Brasil',
    'brazilian',
    'pt-BR',
  ],
  [
    'Romanian',
    'Română',
    'romanian',
    'ro',
  ],
  [
    'Russian',
    'Русский',
    'russian',
    'ru',
  ],
  [
    'Spanish-Spain',
    'Español-España',
    'spanish',
    'es',
  ],
  [
    'Spanish-Latin America',
    'Español-Latinoamérica',
    'latam',
    'es-419',
  ],
  [
    'Swedish',
    'Svenska',
    'swedish',
    'sv',
  ],
  [
    'Thai',
    'ไทย',
    'thai',
    'th',
  ],
  [
    'Turkish',
    'Türkçe',
    'turkish',
    'tr',
  ],
  [
    'Ukrainian',
    'Українська',
    'ukrainian',
    'uk',
  ],
  [
    'Vietnamese',
    'Tiếng Việt',
    'vietnamese',
    'vn',
  ],
  [
    'Chinese (Simplified)',
    '简体中文',
    'sc_schinese',
    'zh-XC',
  ],
];

/**
 * English Name, Native Name, API language code, Web API language code
 */
const TYPES = {
  english: 0,
  native: 1,
  api: 2,
  webapi: 3,
};

export default (input: string, inputType: string, output: string) => {
  if (Object.keys(TYPES).indexOf(output) === -1 || Object.keys(TYPES).indexOf(inputType) === -1) {
    return null;
  }

  for (let i = 0; i < LANGS.length; i++) {
    const lang = LANGS[i];
    if (lang[TYPES[inputType]].toLowerCase() == input.toLowerCase()) {
      return lang[TYPES[output]];
    }
  }

  return null;
};
