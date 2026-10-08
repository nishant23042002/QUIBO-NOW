import { formatRupees, subtract } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  CardTitle,
  DietMark,
  DiscountRibbon,
  FactTable,
  Icon,
  PackPicker,
  PriceBadge,
  ProductGallery,
  ProductRail,
  Skeleton,
  SkeletonScope,
  Stepper,
  Text,
  TrustTiles,
  radius,
  space,
} from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { useHomeItems, type HomeItem } from './items';
import { moreFromShop, similarItems } from './product';
import { useProductDetails } from './productDetails';
import { useShop } from './sampleShops';

/** How long the loading skeleton shows when the page opens, as real data would take to arrive. */
const LOAD_MS = 400;
/** The height of the bar with the price and ADD, above the bottom navigation bar. */
const ACTION_HEIGHT = 68;
/** The picture's width over its height: the same as the gallery's, so the skeleton is the same size. */
const PICTURE_RATIO = 1.1;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[3], paddingTop: space[3] },
    gutter: { paddingHorizontal: space[3] },
    // Every block of the page is a card: white on the soft page, one rounded edge, one line.
    card: {
      gap: space[2],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    ribbon: { position: 'absolute', top: 0, left: space[4] },
    packRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space[3] },
    fact: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    shop: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
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
    rail: { paddingBottom: space[2] },
    section: { gap: space[3] },
    more: {
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      alignSelf: 'center',
      paddingHorizontal: space[4],
      borderRadius: radius.full,
      backgroundColor: c.accentSubtle,
    },
    flipped: { transform: [{ rotate: '180deg' }] },
    shopName: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  });

/** The page while the item loads: a picture block and a few cards, in the shapes of the real page. */
function ProductSkeleton({ label, width }: { label: string; width: number }) {
  const styles = useStyles(makeStyles);
  const picture = Math.round((width - space[3] * 2) / PICTURE_RATIO);
  return (
    <SkeletonScope label={label}>
      <View style={[styles.content, styles.gutter]}>
        <Skeleton height={picture} rounded={radius.lg} />
        <View style={styles.card}>
          <Skeleton width="80%" height={26} />
          <Skeleton width="40%" height={16} />
          <Skeleton width={110} height={28} rounded={radius.md} />
          <Skeleton width="50%" height={14} />
        </View>
        <Skeleton height={96} rounded={radius.lg} />
      </View>
    </SkeletonScope>
  );
}

/**
 * An item's own page, built from cards on a soft page. First the pictures (swipe, or tap a thumbnail), then a card
 * with the name, net quantity, price (what the shopper saves, "inclusive of all taxes"), stock and delivery
 * window; the sizes to choose from; which shop sells it (tap to open the shop); and a row of the shop's other items.
 * ADD sits in a bar above the bottom navigation, and turns into the stepper. The cart bar docks above that bar,
 * so the cart is one tap away here as everywhere.
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
  const { width } = useWindowDimensions();
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const shop = useShop(item.shop);
  const details = useProductDetails(item, {
    id: item.shop,
    name: item.shopName,
    licence: shop?.licence ?? '',
    care: shop?.care ?? '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [item.id]);

  // The size chosen on this page; it starts as the one the card showed.
  const [packId, setPackId] = useState(item.defaultPackId);
  const pack = item.packs.find((candidate) => candidate.id === packId) ?? item.packs[0];
  if (pack === undefined) return null;
  const quantity = cart.quantities[pack.id] ?? 0;
  const out = pack.stock?.kind === 'out';
  const more = moreFromShop(items, item);
  const similar = similarItems(items, item);
  const saved =
    pack.mrp !== undefined && pack.mrp > pack.price ? subtract(pack.mrp, pack.price) : undefined;
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
            <ProductGallery
              images={item.images}
              tint={tintOf(item.category)}
              photoLabel={(position, total) => t('product.photoOf', { n: position, total })}
              faded={out}
              overlay={
                pack.ribbon !== undefined && !out ? (
                  <View style={styles.ribbon}>
                    <DiscountRibbon amount={pack.ribbon.amount} offLabel={pack.ribbon.offLabel} />
                  </View>
                ) : undefined
              }
            />
          </View>
          <View style={styles.gutter}>
            <View style={styles.card}>
              <View style={styles.packRow}>
                <DietMark kind={item.diet.kind} label={item.diet.label} size={18} />
                <Text variant="small" color="inkMuted">
                  {item.diet.label}
                </Text>
              </View>
              <Text variant="title">{item.name}</Text>
              <Text color="inkMuted">{t('product.netQuantity', { pack: pack.label })}</Text>
              <View style={styles.priceRow}>
                <PriceBadge
                  amount={pack.price}
                  {...(pack.mrp !== undefined ? { mrp: pack.mrp } : {})}
                />
                {saved !== undefined ? (
                  <Text variant="strong" color="accentInk">
                    {t('product.save', { amount: formatRupees(saved) })}
                  </Text>
                ) : null}
              </View>
              <Text variant="small" color="inkMuted">
                {t('product.taxes')}
              </Text>
              {pack.stock?.kind === 'low' ? (
                <Text variant="strong" color="warning">
                  {pack.stock.label}
                </Text>
              ) : null}
              {pack.quickLabel !== undefined && !out ? (
                <View style={styles.fact}>
                  <Icon name="clock" color={colors.accentInk} size={18} />
                  <Text variant="strong">{pack.quickLabel}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {item.packs.length > 1 ? (
            <View style={styles.gutter}>
              <View style={styles.card}>
                <PackPicker
                  title={t('product.pickSize')}
                  selectedId={pack.id}
                  onSelect={setPackId}
                  options={item.packs.map((option) => ({
                    id: option.id,
                    label: option.label,
                    priceLabel: formatRupees(option.price),
                    ...(option.unitPriceLabel !== undefined
                      ? { unitLabel: option.unitPriceLabel }
                      : {}),
                    ...(option.bestValue ? { tagLabel: t('product.bestValue') } : {}),
                    ...(option.available ? {} : { unavailableLabel: t('home.rails.outOfStock') }),
                  }))}
                />
              </View>
            </View>
          ) : null}
          <View style={styles.gutter}>
            <View style={styles.card}>
              <TrustTiles
                tiles={[
                  {
                    key: 'verified',
                    icon: 'shield',
                    title: t('product.trust.verified.title'),
                    body: t('product.trust.verified.body'),
                  },
                  {
                    key: 'packed',
                    icon: 'store',
                    title: t('product.trust.packed.title'),
                    body: t('product.trust.packed.body', { shop: item.shopName }),
                  },
                  {
                    key: 'window',
                    icon: 'clock',
                    title: t('product.trust.window.title'),
                    body: t('product.trust.window.body'),
                  },
                  {
                    key: 'replace',
                    icon: 'repeat',
                    title: t('product.trust.replace.title'),
                    body: t('product.trust.replace.body'),
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.gutter}>
            <View style={[styles.card, styles.section]}>
              <CardTitle>{t('product.highlights')}</CardTitle>
              <FactTable
                rows={
                  expanded ? [...details.highlights, ...details.moreHighlights] : details.highlights
                }
              />
              <Pressable
                role="button"
                aria-expanded={expanded}
                aria-label={expanded ? t('product.viewLess') : t('product.viewMore')}
                onPress={() => {
                  setExpanded((current) => !current);
                }}
                style={({ pressed }) => [styles.more, pressed && styles.pressed]}
              >
                <Text variant="strong" color="accentInk">
                  {expanded ? t('product.viewLess') : t('product.viewMore')}
                </Text>
                <View style={expanded ? styles.flipped : undefined}>
                  <Icon name="chevron" color={colors.accentInk} size={16} />
                </View>
              </Pressable>
            </View>
          </View>
          <View style={styles.gutter}>
            <View style={[styles.card, styles.section]}>
              <CardTitle>{t('product.information')}</CardTitle>
              <FactTable rows={[...details.information, ...details.seller]} />
            </View>
          </View>
          <View style={styles.gutter}>
            <Pressable
              role="button"
              aria-label={`${t('product.soldBy', { shop: item.shopName })}. ${t('product.openShop')}`}
              onPress={openShop}
              style={({ pressed }) => [styles.card, styles.shop, pressed && styles.pressed]}
            >
              <View style={styles.shopIcon}>
                <Icon name="store" color={colors.accentInk} size={20} />
              </View>
              <View style={styles.shopText}>
                <View style={styles.shopName}>
                  <Text variant="strong" numberOfLines={1}>
                    {t('product.soldBy', { shop: item.shopName })}
                  </Text>
                  <Icon name="shield" color={colors.accentInk} size={16} />
                </View>
                <Text variant="small" color="inkMuted" numberOfLines={2}>
                  {[shop?.statusLabel, shop?.sinceLabel]
                    .filter((part) => part !== undefined)
                    .join(' \u00B7 ')}
                </Text>
              </View>
              <Icon name="chevronRight" color={colors.accentInk} size={18} />
            </Pressable>
          </View>
          {more.length > 0 ? (
            <View style={styles.rail}>
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
          {similar.length > 0 ? (
            <View style={styles.rail}>
              <ProductRail
                title={t('product.popularIn', { category: t(`home.categories.${item.category}`) })}
              >
                {similar.map((other) => (
                  <ItemTile key={other.id} item={other} width={RAIL_CARD_WIDTH} />
                ))}
              </ProductRail>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <ProductSkeleton label={t('common.loading')} width={width} />
      )}
      <View style={[styles.action, { bottom: dock }]}>
        <PriceBadge amount={pack.price} {...(pack.mrp !== undefined ? { mrp: pack.mrp } : {})} />
        {out ? (
          <Text variant="strong" color="inkMuted">
            {pack.stock?.label}
          </Text>
        ) : quantity === 0 ? (
          <View style={styles.add}>
            <Button
              label={t('home.rails.add')}
              onPress={() => {
                cart.setQuantity(pack.id, 1);
              }}
            />
          </View>
        ) : (
          <Stepper
            value={quantity}
            onChange={(next) => {
              cart.setQuantity(pack.id, next);
            }}
            {...stepper}
          />
        )}
      </View>
      <CartLayer bottom={dock + ACTION_HEIGHT} />
    </View>
  );
}
