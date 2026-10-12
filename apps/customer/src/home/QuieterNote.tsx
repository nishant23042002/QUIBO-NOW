import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, radius, space } from '@/ui';

/** The note's least height, shared with the loading skeleton. */
export const QUIETER_NOTE_HEIGHT = 56;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    note: {
      marginHorizontal: space[4],
      minHeight: QUIETER_NOTE_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.lilac,
    },
    words: { flex: 1, minWidth: 0 },
    pressed: { opacity: 0.85 },
  });

/**
 * A quiet line near the end of Home: a quieter time of day costs less to deliver, and the way to see it. It is true (a rush-hour window
 * adds a set amount to the fee, and the time-picker shows what each window costs) and it opens that picker.
 */
export function QuieterNote() {
  const { t } = useLanguage();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="link"
      aria-label={t('home.quieterNote')}
      onPress={() => {
        router.push('/schedule');
      }}
      style={({ pressed }) => [styles.note, pressed && styles.pressed]}
    >
      <Icon name="clock" color={colors.action} size={22} />
      <View style={styles.words}>
        <Text variant="strong">{t('home.quieterNote')}</Text>
      </View>
      <Icon name="chevronRight" color={colors.inkMuted} size={18} />
    </Pressable>
  );
}
