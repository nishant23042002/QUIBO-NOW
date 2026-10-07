import { Card } from '@quibo/ui';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { routing } from '@/i18n/routing';

// Phase 0 placeholder. The real home (your shops, categories, reorder strip) is Phase 1.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <LanguageSwitcher locale={locale} />
      <h1 className="text-3xl font-bold text-ink">{t('title')}</h1>
      <p className="text-lg text-ink">{t('subtitle')}</p>
      <Card>
        <p>{t('windowNote')}</p>
      </Card>
    </main>
  );
}
