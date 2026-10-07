import { loadMessages } from '@quibo/i18n';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  // An explicit locale (for example getTranslations({ locale })) wins; otherwise read the
  // [locale] segment of the URL.
  const candidate = locale ?? (await rootParams.locale());
  if (!hasLocale(routing.locales, candidate)) notFound();

  return { locale: candidate, messages: await loadMessages(candidate) };
});
