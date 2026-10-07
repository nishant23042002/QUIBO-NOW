import { DEFAULT_LOCALE, LOCALES } from '@quibo/i18n';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Every page lives under /en, /hi or /mr, so each page is static and each URL has one language.
  localePrefix: 'always',
});
