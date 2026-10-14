import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, PlumCard, Text, radius, space } from '@/ui';

const TICK = 24;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingHorizontal: space[4] },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
    tick: {
      width: TICK,
      height: TICK,
      marginTop: 1,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
    },
    line: { flex: 1 },
    button: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.onPlumMuted,
      paddingHorizontal: space[4],
    },
    pressed: { opacity: 0.8 },
  });

const LINES = [
  'home.promise.visited',
  'home.promise.name',
  'home.promise.price',
  'home.promise.paused',
] as const;

/**
 * "The Quibo promise" (ADR 0054): four things the app commits to, near the bottom of Home, with a button to "How we check a shop".
 * They are the same four a shop is held to, so each line is something that can be checked.
 */
export function QuiboPromise({ onHow }: { onHow: () => void }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.wrap}>
      <PlumCard>
        <Text variant="heading" color="onPlum">
          {t('home.promise.title')}
        </Text>
        {LINES.map((key) => (
          <View key={key} style={styles.row}>
            <View style={styles.tick} aria-hidden>
              <Icon name="check" color={colors.onAccent} size={14} />
            </View>
            <View style={styles.line}>
              <Text color="onPlum">{t(key)}</Text>
            </View>
          </View>
        ))}
        <Pressable
          role="button"
          onPress={onHow}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text variant="label" color="onPlum">
            {t('home.promise.how')}
          </Text>
          <Icon name="chevronRight" color={colors.onPlum} size={18} />
        </Pressable>
      </PlumCard>
    </View>
  );
}
