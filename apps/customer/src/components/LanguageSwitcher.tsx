import type { Locale } from '@quibo/i18n';
import { cx } from '@quibo/ui';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

/**
 * Plain server-rendered links, one per language. They need no JavaScript to work or to render,
 * and each language has its own shareable URL. Each name is written in its own language and
 * tagged with it.
 *
 * Two things are deliberate:
 * - Not next-intl's <Link>, and not importing src/i18n/navigation.ts: creating that module
 *   registers a client component, and Next then ships next-intl's client runtime (about
 *   13 kB gzip, measured in Phase 0) with the page even if nothing renders it. Add the
 *   navigation module only where a client component needs it.
 * - The href is `/${locale}` because routing uses localePrefix 'always'. The e2e smoke test
 *   asserts every link's href, so a change to the routing config cannot slip through.
 */
export async function LanguageSwitcher({ locale: current }: { locale: Locale }) {
  const t = await getTranslations({ locale: current, namespace: 'language' });

  return (
    <nav aria-label={t('label')}>
      <ul className="flex flex-wrap gap-2">
        {routing.locales.map((locale) => (
          <li key={locale}>
            <a
              href={`/${locale}`}
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
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
