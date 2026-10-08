import { LOCALES, messages } from '@quibo/i18n';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TAP_MIN, colors, radius, space } from '@/ui';
import { useLanguage } from './LanguageProvider';

/** One button per language, each named in its own language so anyone can find theirs. */
export function LanguageSwitcher() {
  const { locale: current, setLocale, t } = useLanguage();

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
            <Text variant="label" color={selected ? 'onBrand' : 'ink'}>
              {messages[locale].language[locale]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
  selected: { backgroundColor: colors.brand, borderColor: colors.brand },
  idle: { backgroundColor: colors.surface, borderColor: colors.lineStrong },
  pressed: { opacity: 0.8 },
});
