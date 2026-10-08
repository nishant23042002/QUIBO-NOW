import {
  DEFAULT_LOCALE,
  isLocale,
  messages,
  translate,
  type Locale,
  type MessageKey,
  type MessageValues,
} from '@quibo/i18n';
import { getLocales } from 'expo-localization';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface Language {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** The message for a key, in the current language. A misspelt key fails to compile. */
  t: (key: MessageKey, values?: MessageValues) => string;
}

const LanguageContext = createContext<Language | null>(null);

/** The phone's language if we have it, otherwise English. */
function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return isLocale(code) ? code : DEFAULT_LOCALE;
}

/**
 * Holds the chosen language for the whole app. The choice is kept in memory only, so it starts
 * from the phone's language again on the next launch. Remembering it is Phase 1 (PHASE-1-notes.md).
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(deviceLocale);
  const value = useMemo<Language>(
    () => ({ locale, setLocale, t: (key, values) => translate(messages[locale], key, values) }),
    [locale],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage(): Language {
  const language = useContext(LanguageContext);
  if (language === null) throw new Error('useLanguage needs a <LanguageProvider> above it.');
  return language;
}
