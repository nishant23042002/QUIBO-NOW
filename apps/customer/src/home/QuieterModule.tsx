import { formatRupees, money } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, radius, space } from '@/ui';
import { quieterWindows } from './quieterTimes';
import { useSlotText } from './slotText';

/** The module's height, shared with the loading skeleton: a head, one line of words and a row of windows. */
export const QUIET_HEIGHT = 148;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    module: { marginHorizontal: space[4] },
    card: {
      paddingVertical: space[3],
      gap: space[2],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    head: {
      paddingHorizontal: space[3],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
    },
    title: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    pick: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingLeft: space[2],
    },
    sub: { paddingHorizontal: space[3] },
    chips: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[3] },
    chip: {
      minHeight: 48,
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.bg,
    },
    best: { borderColor: c.accent, borderWidth: 1.5 },
    pressed: { opacity: 0.85 },
  });

/**
 * "Quieter times" (ADR 0055, step 8; made compact after step 11): quieter times of day cost less to deliver, and this is the way to
 * see it. One small card near the end of Home: a head with a "Pick a window" link, one line of words, and a row of windows that
 * scrolls sideways, each with what it saves against a rush hour from the town's own rules (a window inside the rush hours says so and
 * promises no saving). Every chip and the link open the schedule page.
 */
export function QuieterModule() {
  const { t } = useLanguage();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const slotText = useSlotText();
  const windows = quieterWindows();
  const open = () => {
    router.push('/schedule');
  };

  return (
    <View style={styles.module} aria-label={t('home.quiet.title')}>
      <View style={styles.card}>
        <View style={styles.head}>
          <View style={styles.title}>
            <NativeText
              allowFontScaling={false}
              aria-hidden
              style={{ fontSize: 20, lineHeight: 26 }}
            >
              {'\u{1F558}'}
            </NativeText>
            <Text variant="label" role="heading" numberOfLines={1}>
              {t('home.quiet.title')}
            </Text>
          </View>
          <Pressable
            role="button"
            aria-label={t('home.quiet.pick')}
            onPress={open}
            hitSlop={{ top: 4, bottom: 4 }}
            style={({ pressed }) => [styles.pick, pressed && styles.pressed]}
          >
            <Text variant="strong" color="accentInk" numberOfLines={1}>
              {t('home.quiet.pick')}
            </Text>
            <Icon name="chevronRight" color={colors.accentInk} size={16} />
          </Pressable>
        </View>
        <View style={styles.sub}>
          <Text variant="small" color="inkMuted">
            {t('home.quiet.sub')}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chips}>
            {windows.map((entry) => {
              const saving =
                entry.save === undefined
                  ? t('home.quiet.rush')
                  : t('home.quiet.save', { amount: formatRupees(money(entry.save)) });
              return (
                <Pressable
                  key={entry.hour}
                  role="button"
                  aria-label={`${slotText.windowLabel(entry.hour)}. ${saving}`}
                  onPress={open}
                  style={({ pressed }) => [
                    styles.chip,
                    entry.save !== undefined && styles.best,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text variant="strong" numberOfLines={1}>
                    {slotText.chipLabel(entry.hour)}
                  </Text>
                  <Text
                    variant="fine"
                    color={entry.save === undefined ? 'inkMuted' : 'accentInk'}
                    numberOfLines={1}
                  >
                    {saving}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
