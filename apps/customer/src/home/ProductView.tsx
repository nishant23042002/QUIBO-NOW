import { subtract, formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text as NativeText, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  DietMark,
  DiscountRibbon,
  Icon,
  PriceBadge,
  ProductRail,
  Skeleton,
  SkeletonScope,
  Stepper,
  Text,
  radius,
  space,
} from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { useHomeItems, type HomeItem } from './items';
import { otherItemsInShop } from './product';

/** How long the loading skeleton shows when the page opens, as real data would take to arrive. */
const LOAD_MS = 400;
/** The height of the bar with the price and ADD, above the bottom navigation bar. */
const ACTION_HEIGHT = 68;
const PICTURE_HEIGHT = 260;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[4], paddingTop: space[4] },
    gutter: { paddingHorizontal: space[4] },
    picture: {
      height: PICTURE_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
    },
    ribbon: { position: 'absolute', top: 0, left: space[4] },
    info: { gap: space[2] },
    packRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space[3] },
    fact: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    shop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    shopIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accentSubtle,
    },
    shopText: { flex: 1, minWidth: 0 },
    pressed: { opacity: 0.8 },
    action: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: ACTION_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
    add: { minWidth: 140 },
    more: { paddingBottom: space[2] },
  });

/** The page while the item loads: a picture block and a few lines, in the shapes of the real page. */
function ProductSkeleton({ label }: { label: string }) {
  const styles = useStyles(makeStyles);
  return (
    <SkeletonScope label={label}>
      <View style={[styles.content, styles.gutter]}>
        <Skeleton height={PICTURE_HEIGHT} rounded={radius.lg} />
        <Skeleton width="30%" height={16} />
        <Skeleton width="80%" height={24} />
        <Skeleton width={96} height={28} rounded={radius.md} />
        <Skeleton height={64} rounded={radius.lg} />
      </View>
    </SkeletonScope>
  );
}

/**
 * An item's own page: a big picture on the category tint with the saving ribbon, the name, pack and price (with
 * what the shopper saves), stock and delivery window where they apply, which shop sells it (tap to open the shop),
 * and a row of the shop's other items. ADD sits in a bar above the bottom navigation, and turns into the stepper.
 * The cart bar docks above that bar, so the cart is one tap away here as everywhere.
 */
export function ProductView({ item }: { item: HomeItem }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCart();
  const tintOf = useTintOf();
  const items = useHomeItems();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [item.id]);

  const quantity = cart.quantities[item.id] ?? 0;
  const out = item.stock?.kind === 'out';
  const more = otherItemsInShop(items, item);
  const saved =
    item.mrp !== undefined && item.mrp > item.price ? subtract(item.mrp, item.price) : undefined;
  const dock = insets.bottom + BOTTOM_BAR_HEIGHT;
  const stepper = {
    addLabel: t('home.rails.add'),
    decreaseLabel: t('home.rails.removeOne'),
    increaseLabel: t('home.rails.addOne'),
  };

  const openShop = () => {
    router.push({ pathname: '/shop/[id]', params: { id: item.shop } });
  };

  return (
    <View style={styles.page}>
      {loaded ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: dock + ACTION_HEIGHT + space[6] + (cart.count > 0 ? CART_ROOM : 0) },
          ]}
        >
          <View style={styles.gutter}>
            <View style={[styles.picture, { backgroundColor: tintOf(item.category) }]}>
              <NativeText
                allowFontScaling={false}
                style={{ fontSize: 120, lineHeight: 150, opacity: out ? 0.35 : 1 }}
                aria-hidden
              >
                {item.emoji}
              </NativeText>
              {item.ribbon !== undefined && !out ? (
                <View style={styles.ribbon}>
                  <DiscountRibbon amount={item.ribbon.amount} offLabel={item.ribbon.offLabel} />
                </View>
              ) : null}
            </View>
          </View>
          <View style={[styles.gutter, styles.info]}>
            <View style={styles.packRow}>
              <DietMark kind={item.diet.kind} label={item.diet.label} size={18} />
              <Text color="inkMuted">{item.pack}</Text>
            </View>
            <Text variant="title">{item.name}</Text>
            <View style={styles.priceRow}>
              <PriceBadge
                amount={item.price}
                {...(item.mrp !== undefined ? { mrp: item.mrp } : {})}
              />
              {saved !== undefined ? (
                <Text variant="strong" color="accentInk">
                  {t('product.save', { amount: formatRupees(saved) })}
                </Text>
              ) : null}
            </View>
            {item.stock?.kind === 'low' ? (
              <Text variant="strong" color="warning">
                {item.stock.label}
              </Text>
            ) : null}
            {item.quickLabel !== undefined && !out ? (
              <View style={styles.fact}>
                <Icon name="clock" color={colors.accentInk} size={18} />
                <Text variant="strong">{item.quickLabel}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.gutter}>
            <Pressable
              role="button"
              aria-label={t('product.soldBy', { shop: item.shopName })}
              onPress={openShop}
              style={({ pressed }) => [styles.shop, pressed && styles.pressed]}
            >
              <View style={styles.shopIcon}>
                <Icon name="store" color={colors.accentInk} size={20} />
              </View>
              <View style={styles.shopText}>
                <Text variant="strong" numberOfLines={1}>
                  {t('product.soldBy', { shop: item.shopName })}
                </Text>
                <Text variant="small" color="inkMuted" numberOfLines={2}>
                  {t('product.about')}
                </Text>
              </View>
              <Icon name="chevronRight" color={colors.inkMuted} size={18} />
            </Pressable>
          </View>
          {more.length > 0 ? (
            <View style={styles.more}>
              <ProductRail
                title={t('product.moreFrom', { shop: item.shopName })}
                seeAllLabel={t('home.rails.seeAll')}
                onSeeAll={openShop}
              >
                {more.map((other) => (
                  <ItemTile key={other.id} item={other} width={RAIL_CARD_WIDTH} />
                ))}
              </ProductRail>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <ProductSkeleton label={t('common.loading')} />
      )}
      <View style={[styles.action, { bottom: dock }]}>
        <PriceBadge amount={item.price} {...(item.mrp !== undefined ? { mrp: item.mrp } : {})} />
        {out ? (
          <Text variant="strong" color="inkMuted">
            {item.stock?.label}
          </Text>
        ) : quantity === 0 ? (
          <View style={styles.add}>
            <Button
              label={t('home.rails.add')}
              onPress={() => {
                cart.setQuantity(item.id, 1);
              }}
            />
          </View>
        ) : (
          <Stepper
            value={quantity}
            onChange={(next) => {
              cart.setQuantity(item.id, next);
            }}
            {...stepper}
          />
        )}
      </View>
      <CartLayer bottom={dock + ACTION_HEIGHT} />
    </View>
  );
}
