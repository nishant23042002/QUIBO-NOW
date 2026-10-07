import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { env } from '@/env';
import { routing } from '@/i18n/routing';
import '../globals.css';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'app' });
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: t('name'),
    description: t('description'),
    applicationName: t('name'),
    // Declared so browsers do not ask for /favicon.ico, which would be a 404.
    icons: {
      icon: [{ url: '/pwa-icons/192.png', sizes: '192x192', type: 'image/png' }],
      apple: [{ url: '/pwa-icons/192.png', sizes: '192x192', type: 'image/png' }],
    },
  };
}

export const viewport: Viewport = {
  // Same value as --qb-color-brand in packages/ui/src/styles/tokens.css. CSS variables cannot
  // be read here, so it is repeated; the brand is undecided, so this changes with the tokens.
  themeColor: '#1b6b3a',
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
