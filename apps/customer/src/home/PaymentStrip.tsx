import type { MessageKey } from '@quibo/i18n';
import { formatRupees } from '@quibo/contracts';
import { Text as NativeText, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Text, radius, space } from '@/ui';
import { FREE_DELIVERY_FROM, ZONE } from './delivery';
import { stripChips, type StripChipId } from './stripChips';

const EMOJI: Readonly<Record<StripChipId, string>> = {
  cod: '\u{1F4B5}',
  visited: '\u{2705}',
  free: '\u{1F6F5}',
  upi: '\u{1F4F2}',
};

const WORDS: Readonly<Record<StripChipId, { title: MessageKey; sub: MessageKey }>> = {
  cod: { title: 'home.strip.cod', sub: 'home.strip.codSub' },
  visited: { title: 'home.strip.visited', sub: 'home.strip.visitedSub' },
  free: { title: 'home.strip.free', sub: 'home.strip.freeSub' },
  upi: { title: 'home.strip.upi', sub: 'home.strip.upiSub' },
};

/** The stamped edge under a filled chip, like the price badge's. */
const EDGE = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: space[2],
      paddingHorizontal: space[4],
      paddingRight: space[4] + EDGE,
    },
    chip: {
      minHeight: space[12],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingVertical: space[1],
      paddingLeft: space[1] + 2,
      paddingRight: space[3],
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    filled: {
      borderColor: c.accent,
      backgroundColor: c.accent,
      borderBottomColor: c.accentEdge,
      borderRightColor: c.accentEdge,
      borderBottomWidth: EDGE,
      borderRightWidth: EDGE,
    },
    bubble: {
      width: 32,
      height: 32,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.lilac,
    },
    bubbleFilled: { backgroundColor: c.surface },
    words: { flexShrink: 1 },
  });

/**
 * The payment and trust strip under Home's mosaic: what a first-time customer wants to know before anything else. Pay on delivery
 * is the one filled chip, with the same stamped edge as the price badge, so it is found at once. The chips are statements, not
 * buttons; "Visited shops only" opens its sheet when the trust section is built (step 4).
 */
export function PaymentStrip() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const chips = stripChips({ codMax: ZONE.payment.codMaxNewCustomer });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      aria-label={t('home.strip.label')}
    >
      {chips.map((id) => {
        const filled = id === 'cod';
        const words = WORDS[id];
        const sub =
          id === 'free' ? t(words.sub, { amount: formatRupees(FREE_DELIVERY_FROM) }) : t(words.sub);
        return (
          <View
            key={id}
            accessible
            aria-label={`${t(words.title)}. ${sub}`}
            style={[styles.chip, filled && styles.filled]}
          >
            <View style={[styles.bubble, filled && styles.bubbleFilled]} aria-hidden>
              <NativeText allowFontScaling={false} style={{ fontSize: 16, lineHeight: 22 }}>
                {EMOJI[id]}
              </NativeText>
            </View>
            <View style={styles.words}>
              <Text variant="strong" color={filled ? 'onAccent' : 'ink'} numberOfLines={1}>
                {t(words.title)}
              </Text>
              <Text variant="fine" color={filled ? 'onAccent' : 'inkMuted'} numberOfLines={1}>
                {sub}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
