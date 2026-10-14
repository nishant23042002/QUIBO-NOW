import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, RowTitle, Text, radius, space } from '@/ui';
import { FREE_DELIVERY_FROM } from './delivery';
import { SAMPLE_COUPONS } from './sampleCoupons';

/** A card's width and height, shared with the loading skeleton. */
export const OFFER_CARD_WIDTH = 264;
export const OFFER_CARD_HEIGHT = 80;
/** How many coupons the row shows beside the free delivery line. */
const COUPONS_SHOWN = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    section: { gap: space[3] },
    pad: { paddingHorizontal: space[4] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    card: {
      width: OFFER_CARD_WIDTH,
      minHeight: OFFER_CARD_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    bubble: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accentSubtle,
    },
    words: { flex: 1, minWidth: 0, gap: 2 },
    pressed: { opacity: 0.85 },
  });

/**
 * "Offers for you" (ADR 0055, step 8): the town's delivery line and the coupons the app has, as a swipeable row of cards. They are
 * the same ones the Coupons page lists (sample coupons until the API supplies real ones), and every card opens that page.
 */
export function OffersForYou() {
  const { t } = useLanguage();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const open = () => {
    router.push('/coupons');
  };
  const cards = [
    {
      key: 'free',
      emoji: '\u{1F6F5}',
      title: t('home.offers.freeTitle', { amount: formatRupees(FREE_DELIVERY_FROM) }),
      sub: t('home.offers.freeSub'),
    },
    ...SAMPLE_COUPONS.slice(0, COUPONS_SHOWN).map((coupon) => ({
      key: coupon.code,
      emoji: '\u{1F3F7}',
      title: t(coupon.descKey),
      sub: t('home.offers.codeSub', { code: coupon.code }),
    })),
  ];

  return (
    <View style={styles.section}>
      <View style={styles.pad}>
        <RowTitle title={t('home.offers.title')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {cards.map((card) => (
            <Pressable
              key={card.key}
              role="button"
              aria-label={`${card.title}. ${card.sub}`}
              onPress={open}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.bubble} aria-hidden>
                <NativeText allowFontScaling={false} style={{ fontSize: 22, lineHeight: 28 }}>
                  {card.emoji}
                </NativeText>
              </View>
              <View style={styles.words}>
                <Text variant="strong" numberOfLines={2}>
                  {card.title}
                </Text>
                <Text variant="fine" color="inkMuted" numberOfLines={1}>
                  {card.sub}
                </Text>
              </View>
              <Icon name="chevronRight" color={colors.inkMuted} size={18} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
