import { LOCALES, messages, type Locale } from '@quibo/i18n';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Sheet, Text, TAP_MIN, radius, space } from '@/ui';
import { useLanguage } from './LanguageProvider';

/** Each language's name in English, as a second line under its own, so a visitor can find theirs by either. */
const ENGLISH_NAME: Readonly<Record<Locale, string>> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
};

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    other: { gap: 2 },
    list: { gap: space[2] },
    option: {
      minHeight: TAP_MIN + space[4],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[2],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    optionOn: { borderWidth: 2, borderColor: c.accentInk, backgroundColor: c.accentSubtle },
    pressed: { opacity: 0.85 },
    words: { flex: 1, minWidth: 0 },
    tick: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  });

interface LanguageSheetApi {
  /** Opens the language sheet, over whatever screen is showing. */
  openLanguageSheet: () => void;
}

const LanguageSheetContext = createContext<LanguageSheetApi | null>(null);

/**
 * The language sheet (ADR 0055, step 9): the three languages as large rows, each in its own script with its English name under it,
 * the one in use ticked. Choosing one changes the words at once and closes the sheet. The heading also names the other two
 * languages in their own words, so someone who landed in a language they do not read can still find theirs.
 *
 * It is mounted once above the screens and opened from the header's language chip on every tab.
 */
export function LanguageSheetProvider({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useLanguage();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const openLanguageSheet = useCallback(() => {
    setOpen(true);
  }, []);
  const api = useMemo<LanguageSheetApi>(() => ({ openLanguageSheet }), [openLanguageSheet]);

  const others = LOCALES.filter((value) => value !== locale)
    .map((value) => messages[value].languageSheet.title)
    .join(' · ');

  return (
    <LanguageSheetContext value={api}>
      {children}
      <Sheet
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={t('languageSheet.title')}
        closeLabel={t('common.close')}
        ruled={false}
      >
        <View style={styles.other}>
          <Text variant="small" color="inkMuted">
            {others}
          </Text>
        </View>
        <View role="radiogroup" aria-label={t('languageSheet.title')} style={styles.list}>
          {LOCALES.map((value) => {
            const selected = value === locale;
            return (
              <Pressable
                key={value}
                role="radio"
                aria-checked={selected}
                onPress={() => {
                  setLocale(value);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionOn,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.words}>
                  <Text variant="heading">{messages[value].language[value]}</Text>
                  {ENGLISH_NAME[value] !== messages[value].language[value] ? (
                    <Text variant="small" color="inkMuted">
                      {ENGLISH_NAME[value]}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.tick} aria-hidden>
                  {selected ? <Icon name="check" color={colors.accentInk} size={22} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text variant="small" color="inkMuted">
          {t('languageSheet.note')}
        </Text>
      </Sheet>
    </LanguageSheetContext>
  );
}

/** Opens the language sheet. Needs the provider above it (the app's root layout has it). */
export function useLanguageSheet(): LanguageSheetApi {
  const api = useContext(LanguageSheetContext);
  if (api === null) throw new Error('useLanguageSheet needs a <LanguageSheetProvider> above it.');
  return api;
}
