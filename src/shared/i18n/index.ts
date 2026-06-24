import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import nb from './nb.json';

const tag = Localization.getLocales()[0]?.languageTag ?? 'en';
const language = tag.startsWith('nb') || tag.startsWith('no') ? 'nb' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    nb: { translation: nb },
  },
  lng: language,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export { i18n };
export const locale = tag;
