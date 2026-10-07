import type { Locale } from '@quibo/i18n';
import { cx } from '@quibo/ui';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

/**
 * Plain links, one per language, so switching works without JavaScript and each language has
 * its own shareable URL. Each name is written in its own language and tagged with it.
 */
export async function LanguageSwitcher({ locale: current }: { locale: Locale }) {
  const t = await getTranslations({ locale: current, namespace: 'language' });

  return (
    <nav aria-label={t('label')}>
      <ul className="flex flex-wrap gap-2">
        {routing.locales.map((locale) => (
          <li key={locale}>
            <Link
              href="/"
              locale={locale}
              lang={locale}
              hrefLang={locale}
              aria-current={locale === current ? 'true' : undefined}
              className={cx(
                'tap-target inline-flex items-center justify-center rounded-full border-2 px-5 text-base font-semibold',
                locale === current
                  ? 'border-brand bg-brand text-on-brand'
                  : 'border-line-strong bg-surface text-ink hover:bg-surface-muted',
              )}
            >
              {t(locale)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
