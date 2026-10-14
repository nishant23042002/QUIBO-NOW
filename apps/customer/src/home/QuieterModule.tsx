import { formatRupees, money } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { LetteredTitle, Text, radius, space } from '@/ui';
import { quieterWindows } from './quieterTimes';
import { useSlotText } from './slotText';

/** A window tile's least height, shared with the loading skeleton. */
export const QUIET_TILE_HEIGHT = 72;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    module: { marginHorizontal: space[4], gap: space[3] },
    // A warm block, so the module reads as its own thing between the shelves.
    inset: {
      padding: space[3],
      gap: space[3],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.warningBg,
    },
    grid: { flexDirection: 'row', gap: space[2] },
    tall: {
      flex: 1,
      justifyContent: 'flex-end',
      gap: space[1],
      padding: space[3],
      borderRadius: radius.lg,
      backgroundColor: c.action,
    },
    tallText: { gap: 2 },
    windows: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    tile: {
      width: '47.5%',
      flexGrow: 1,
      minHeight: QUIET_TILE_HEIGHT,
      justifyContent: 'center',
      gap: 2,
      padding: space[2],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    best: { borderColor: c.accent, borderWidth: 2 },
    pressed: { opacity: 0.85 },
  });

/**
 * "Quieter times" (ADR 0055, step 8): quieter times of day cost less to deliver, and this is the way to see it. A lettered title
 * on a warm block, a big "Pick a window" tile and a few windows spread across the day, each with what it saves against a rush hour
 * from the town's own rules (a window inside the rush hours says so and promises no saving). Every tile opens the schedule page.
 */
export function QuieterModule() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const slotText = useSlotText();
  const windows = quieterWindows();
  const open = () => {
    router.push('/schedule');
  };

  return (
    <View style={styles.module} aria-label={t('home.quiet.title')}>
      <View style={styles.inset}>
        <LetteredTitle
          word={t('home.quiet.word')}
          sticker={t('home.quiet.sticker')}
          sub={t('home.quiet.sub')}
          flush
        />
        <View style={styles.grid}>
          <Pressable
            role="button"
            aria-label={`${t('home.quiet.pick')}. ${t('home.quiet.pickSub')}`}
            onPress={open}
            style={({ pressed }) => [styles.tall, pressed && styles.pressed]}
          >
            <NativeText
              allowFontScaling={false}
              aria-hidden
              style={{ fontSize: 30, lineHeight: 38 }}
            >
              {'\u{1F558}'}
            </NativeText>
            <View style={styles.tallText}>
              <Text variant="label" color="onAction">
                {t('home.quiet.pick')}
              </Text>
              <Text variant="fine" color="onAction">
                {t('home.quiet.pickSub')}
              </Text>
            </View>
          </Pressable>
          <View style={styles.windows}>
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
                    styles.tile,
                    entry.save !== undefined && styles.best,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text variant="strong" numberOfLines={1}>
                    {slotText.chipLabel(entry.hour)}
                  </Text>
                  <Text variant="fine" color="inkMuted" numberOfLines={1}>
                    {saving}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
