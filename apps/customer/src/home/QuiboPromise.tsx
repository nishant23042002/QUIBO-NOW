import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, radius, space } from '@/ui';

const TICK = 22;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingHorizontal: space[4] },
    card: {
      padding: space[3],
      gap: space[3],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.lilac,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    title: { flex: 1, minWidth: 0 },
    how: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 2 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    cell: {
      width: '48.5%',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[2],
      padding: space[2],
      borderRadius: radius.lg,
      backgroundColor: c.surface,
    },
    tick: {
      width: TICK,
      height: TICK,
      marginTop: 1,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
    },
    words: { flex: 1, minWidth: 0 },
    pressed: { opacity: 0.8 },
  });

/** The four promises, each a short claim and the one line that says how it is kept. */
const PROMISES = [
  { title: 'home.promise.visited', body: 'home.promise.visitedBody' },
  { title: 'home.promise.name', body: 'home.promise.nameBody' },
  { title: 'home.promise.price', body: 'home.promise.priceBody' },
  { title: 'home.promise.paused', body: 'home.promise.pausedBody' },
] as const;

/**
 * "The Quibo promise" (ADR 0054; made compact after step 11): four things the app commits to, near the bottom of Home. A small card
 * with the title and a "How we check" link, then the four as a two-by-two grid, each a short claim over the line that says how it is
 * kept, so every one can be checked. It is the same four a shop is held to.
 */
export function QuiboPromise({ onHow }: { onHow: () => void }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.head}>
          <View style={styles.title}>
            <Text variant="subheading" role="heading">
              {t('home.promise.title')}
            </Text>
          </View>
          <Pressable
            role="button"
            aria-label={t('home.promise.how')}
            onPress={onHow}
            hitSlop={{ top: 4, bottom: 4 }}
            style={({ pressed }) => [styles.how, pressed && styles.pressed]}
          >
            <Text variant="strong" color="accentInk" numberOfLines={1}>
              {t('home.promise.howShort')}
            </Text>
            <Icon name="chevronRight" color={colors.accentInk} size={16} />
          </Pressable>
        </View>
        <View style={styles.grid}>
          {PROMISES.map((promise) => (
            <View
              key={promise.title}
              style={styles.cell}
              accessible
              aria-label={`${t(promise.title)}. ${t(promise.body)}`}
            >
              <View style={styles.tick} aria-hidden>
                <Icon name="check" color={colors.onAccent} size={13} />
              </View>
              <View style={styles.words}>
                <Text variant="strong" tight>
                  {t(promise.title)}
                </Text>
                <Text variant="fine" tight color="inkMuted">
                  {t(promise.body)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
