import type { Locale, Messages } from '@quibo/i18n';

// Types every t('...') key and locale from packages/i18n, so a wrong key fails typecheck.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
