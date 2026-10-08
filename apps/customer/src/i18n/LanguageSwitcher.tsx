import { LOCALES, messages } from '@quibo/i18n';
import { Pressable, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text, TAP_MIN, radius, space } from '@/ui';
import { useLanguage } from './LanguageProvider';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    button: {
      minHeight: TAP_MIN,
      minWidth: TAP_MIN,
      paddingHorizontal: space[5],
      borderWidth: 2,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selected: { backgroundColor: c.action, borderColor: c.action },
    idle: { backgroundColor: c.surface, borderColor: c.ctl },
    pressed: { opacity: 0.8 },
  });

/** One button per language, each named in its own language so anyone can find theirs. */
export function LanguageSwitcher() {
  const { locale: current, setLocale, t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <View role="radiogroup" aria-label={t('language.label')} style={styles.row}>
      {LOCALES.map((locale) => {
        const selected = locale === current;
        return (
          <Pressable
            key={locale}
            role="radio"
            aria-checked={selected}
            onPress={() => {
              setLocale(locale);
            }}
            style={({ pressed }) => [
              styles.button,
              selected ? styles.selected : styles.idle,
              pressed && styles.pressed,
            ]}
          >
            <Text variant="label" color={selected ? 'onAction' : 'ink'}>
              {messages[locale].language[locale]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
