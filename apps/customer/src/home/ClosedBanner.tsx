import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, radius, space } from '@/ui';
import { useDeliveryWhen } from './deliveryInfo';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    wrap: { paddingHorizontal: space[4], paddingBottom: space[3] },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.lg,
      backgroundColor: c.tagBg,
    },
    words: { flex: 1, minWidth: 0 },
    action: {
      minHeight: space[10],
      justifyContent: 'center',
      paddingHorizontal: space[3],
      borderRadius: radius.md,
      backgroundColor: c.action,
    },
    pressed: { opacity: 0.9 },
  });

/**
 * Shown on Home's canvas while quick delivery is closed (outside the town's quick hours, ADR 0012). It says so plainly, says when
 * the order is set for instead, and puts the choice of window one tap away. The header already shows the next window.
 */
export function ClosedBanner() {
  const { t } = useLanguage();
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const when = useDeliveryWhen();
  if (!when.quickClosed) return null;

  // With a window to fall back on the body names it; with none, it asks for one.
  const body = when.hasWindow
    ? t('home.closed.body', { when: when.short })
    : t('home.closed.bodyNone');

  return (
    <View style={styles.wrap}>
      <View style={styles.card} accessible aria-label={`${t('home.closed.title')}. ${body}`}>
        <Icon name="moon" color={colors.tagFg} size={28} />
        <View style={styles.words}>
          <Text variant="strong" color="tagFg" numberOfLines={2}>
            {t('home.closed.title')}
          </Text>
          <Text variant="fine" color="tagFg" numberOfLines={3}>
            {body}
          </Text>
        </View>
        <Pressable
          role="button"
          aria-label={t('home.closed.action')}
          onPress={() => {
            router.push('/schedule');
          }}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text variant="strong" color="onAction" numberOfLines={2}>
            {t('home.closed.action')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
