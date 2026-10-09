import { formatRupees, money } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Badge,
  Button,
  Input,
  LoadGate,
  Notice,
  StatePanel,
  Text,
  radius,
  space,
  useScreenLoad,
} from '@/ui';
import { armQuietCartReturn } from './cartReturn';
import { useCart } from './CartProvider';
import { CouponsSkeleton } from './CouponsSkeleton';
import { STEP_LOAD_MS, STEP_POLICY } from './loading';
import type { OfferView } from './useCoupon';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    entry: { gap: space[3], padding: space[4] },
    offer: { gap: space[3], padding: space[4] },
    // Wraps: with large text the button (or the "add more" line) drops under the offer instead of squeezing it.
    offerTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[3] },
    offerText: { flexGrow: 1, flexShrink: 1, flexBasis: 120, minWidth: 0, gap: space[1] },
    action: { alignItems: 'flex-end', gap: space[1], marginLeft: 'auto' },
    offerBottom: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[3] },
    // The code, in a dashed box like a coupon you could cut out.
    code: {
      paddingHorizontal: space[3],
      paddingVertical: space[1],
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderRadius: radius.sm,
      borderColor: c.ctl,
    },
    link: { minHeight: 36, justifyContent: 'center' },
    badge: { alignSelf: 'flex-start' },
  });

/**
 * The coupons page. A code can be typed in, and the coupons on offer are listed, the ones that work on the cart first,
 * with what each would save; one that needs more items says how much more. Picking one applies it and returns to the
 * cart. These are sample coupons until real offers arrive, and the page says so.
 */
function CouponsPage() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { coupon } = useCart();
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | undefined>();

  const back = () => {
    armQuietCartReturn();
    if (router.canGoBack()) router.back();
    else router.replace('/cart');
  };

  const submit = () => {
    const result = coupon.apply(typed);
    if (result === 'ok') {
      back();
      return;
    }
    if (result === 'invalid') {
      setError(t('coupons.invalid'));
      return;
    }
    const wanted = typed.trim().toUpperCase();
    const found = coupon.offers.find((view) => view.offer.code === wanted);
    setError(
      found === undefined
        ? t('coupons.invalid')
        : t('coupons.shortApplied', {
            amount: formatRupees(found.shortBy),
            code: found.offer.code,
          }),
    );
  };

  // The one that is applied first, then those that work, best saving first, then those that need more items.
  const rank = (view: OfferView) => (view.applied ? 0 : view.eligible ? 1 : 2);
  const sorted = [...coupon.offers].sort(
    (a, b) => rank(a) - rank(b) || b.discount - a.discount || a.shortBy - b.shortBy,
  );

  // With more than one coupon that works, the one that saves the most is marked.
  const working = sorted.filter((view) => view.eligible && view.discount > 0);
  const topSaving =
    working.length > 1
      ? working.reduce((best, view) => (view.discount > best.discount ? view : best)).offer.code
      : undefined;

  const title = (view: OfferView) =>
    view.offer.kind === 'percent'
      ? t('coupons.percentOff', {
          percent: view.offer.value,
          max: formatRupees(view.offer.maxDiscount ?? money(0)),
        })
      : t('coupons.flatOff', { amount: formatRupees(money(view.offer.value)) });

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + space[6] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Notice tone="info" icon="info" message={t('coupons.sample')} />
        <View style={[styles.card, styles.entry]}>
          <Input
            label={t('coupons.codeLabel')}
            placeholder={t('coupons.codePlaceholder')}
            value={typed}
            onChangeText={(next) => {
              setTyped(next);
              setError(undefined);
            }}
            error={error}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <Button label={t('coupons.apply')} disabled={typed.trim() === ''} onPress={submit} />
        </View>
        {sorted.length === 0 ? (
          <StatePanel icon="bag" title={t('coupons.emptyTitle')} body={t('coupons.emptyBody')} />
        ) : (
          sorted.map((view) => (
            <View key={view.offer.code} style={[styles.card, styles.offer]}>
              <View style={styles.offerTop}>
                <View style={styles.offerText}>
                  {view.offer.code === topSaving ? (
                    <View style={styles.badge}>
                      <Badge label={t('coupons.bestBadge')} tone="success" />
                    </View>
                  ) : null}
                  <Text variant="strong">{title(view)}</Text>
                  <Text variant="small" color="inkMuted">
                    {t(view.offer.descKey)}
                  </Text>
                  <Text variant="fine" color="inkMuted">
                    {t('coupons.minOrder', { amount: formatRupees(view.offer.minOrder) })}
                  </Text>
                </View>
                <View style={styles.action}>
                  {view.applied ? (
                    <>
                      <Badge label={t('coupons.appliedBadge')} tone="success" />
                      <Pressable
                        role="button"
                        hitSlop={6}
                        onPress={coupon.remove}
                        style={styles.link}
                      >
                        <Text variant="strong" color="accentInk">
                          {t('coupons.remove')}
                        </Text>
                      </Pressable>
                    </>
                  ) : view.eligible ? (
                    <Button
                      label={t('coupons.apply')}
                      onPress={() => {
                        coupon.apply(view.offer.code);
                        back();
                      }}
                    />
                  ) : (
                    <Text variant="fine" color="inkMuted" align="center">
                      {t('coupons.addMore', { amount: formatRupees(view.shortBy) })}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.offerBottom}>
                <View style={styles.code}>
                  <Text variant="label">{view.offer.code}</Text>
                </View>
                {view.eligible && view.discount > 0 ? (
                  <Text variant="strong" color="success">
                    {t('coupons.youSave', { amount: formatRupees(view.discount) })}
                  </Text>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

/** The coupons page as it opens: a skeleton with a card for each coupon, then the page fading in over it. */
export function CouponsView() {
  const { coupon, ready } = useCart();
  const load = useScreenLoad({ loadMs: STEP_LOAD_MS, policy: STEP_POLICY, hold: !ready });

  return (
    <LoadGate load={load} skeleton={<CouponsSkeleton offers={coupon.offers.length} />}>
      <CouponsPage />
    </LoadGate>
  );
}
