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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readSetting, writeSetting } from '@/storage';

const LANGUAGE_KEY = 'quibo.language';

interface Language {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** The message for a key, in the current language. A misspelt key fails to compile. */
  t: (key: MessageKey, values?: MessageValues) => string;
  /** False until the stored choice has been read, so the app can wait instead of flashing. */
  ready: boolean;
}

const LanguageContext = createContext<Language | null>(null);

/** The phone's language if we have it, otherwise English. */
function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return isLocale(code) ? code : DEFAULT_LOCALE;
}

/**
 * Holds the chosen language for the whole app. It starts from the phone's language, and a choice
 * made with the language buttons is remembered for the next launch.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(deviceLocale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let current = true;
    void readSetting(LANGUAGE_KEY).then((stored) => {
      if (!current) return;
      if (isLocale(stored)) setLocaleState(stored);
      setReady(true);
    });
    return () => {
      current = false;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    void writeSetting(LANGUAGE_KEY, next);
  }, []);

  const value = useMemo<Language>(
    () => ({
      locale,
      setLocale,
      t: (key, values) => translate(messages[locale], key, values),
      ready,
    }),
    [locale, setLocale, ready],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage(): Language {
  const language = useContext(LanguageContext);
  if (language === null) throw new Error('useLanguage needs a <LanguageProvider> above it.');
  return language;
}
