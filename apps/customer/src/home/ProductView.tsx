import { formatRupees, subtract } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import {
  Animated,
  Easing,
  Pressable,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { useReduceMotion } from '@/ui/useReduceMotion';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  CardTitle,
  DietMark,
  DiscountRibbon,
  FactTable,
  GALLERY_RATIO,
  Icon,
  PackPicker,
  PriceBadge,
  ProductGallery,
  ProductInsight,
  ProductRail,
  Stepper,
  Text,
  TrustTiles,
  radius,
  space,
  type InsightRow,
} from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { ProductHeader } from './ProductHeader';
import { toggleHeaderLook, useHeaderLook } from './productHeaderLook';
import { ProductSkeleton } from './ProductSkeleton';
import { ACTION_HEIGHT, makePageStyles } from './productLayout';
import { useHomeItems, type HomeItem } from './items';
import { moreFromShop, similarItems } from './product';
import { useProductDetails } from './productDetails';
import { useShop } from './sampleShops';

/** How long the loading skeleton shows when the page opens, as real data would take to arrive. */
const LOAD_MS = 400;
/** How long the grey skeleton takes to fade into the real page. */
const FADE_MS = 200;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    ...makePageStyles(c),
    page: { flex: 1, backgroundColor: c.bg },
    body: { flex: 1 },
    fill: { flex: 1 },
    // The skeleton, laid over the real page while it fades in.
    cover: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.bg },
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

/**
 * An item's own page, built from cards on a soft page. First the pictures (swipe, or tap a thumbnail), then a card
 * with the name, net quantity, price (what the shopper saves, "inclusive of all taxes"), stock and delivery
 * window; the sizes to choose from; which shop sells it (tap to open the shop); and a row of the shop's other items.
 * ADD sits in a bar above the bottom navigation, and turns into the stepper. The cart bar docks above that bar,
 * so the cart is one tap away here as everywhere.
 */
export function ProductView({ item, onBack }: { item: HomeItem; onBack: () => void }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCart();
  const tintOf = useTintOf();
  const items = useHomeItems();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const headerLook = useHeaderLook();
  const [loaded, setLoaded] = useState(false);
  // 0 while the skeleton shows, 1 once the real page has faded in over it. The skeleton goes when the fade is done.
  const [reveal] = useState(() => new Animated.Value(0));
  const [skeletonOn, setSkeletonOn] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [scrollY] = useState(() => new Animated.Value(0));
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

  // The real page is drawn under the skeleton from the first frame, so its pictures are ready when it fades in,
  // and the swap is a cross-fade instead of one frame where the skeleton vanishes and the page pops in.
  useEffect(() => {
    if (!loaded) return undefined;
    const fade = Animated.timing(reveal, {
      toValue: 1,
      duration: reduceMotion ? 0 : FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    fade.start(({ finished }) => {
      if (finished) setSkeletonOn(false);
    });
    return () => {
      fade.stop();
    };
  }, [loaded, reduceMotion, reveal]);

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

  // The picture's insight card: only the facts that apply to this product and size.
  const { glance } = details;
  const insightRows: InsightRow[] = [
    { key: 'from', icon: 'pin', text: t('product.insight.from', { place: glance.place }) },
    ...(glance.shelfLabel !== undefined && glance.shelfDays !== undefined
      ? [
          {
            key: 'keeps',
            icon: 'clock' as const,
            text: t('product.insight.keeps', { shelf: glance.shelfLabel }),
            days: glance.shelfDays,
          },
        ]
      : []),
    ...(glance.goodFor !== undefined
      ? [
          {
            key: 'good',
            icon: 'check' as const,
            text: t('product.insight.goodFor', { use: glance.goodFor }),
          },
        ]
      : []),
    ...(pack.unitPriceLabel !== undefined
      ? [
          {
            key: 'value',
            icon: 'bag' as const,
            text: t(pack.bestValue ? 'product.insight.bestValue' : 'product.insight.perUnit', {
              unit: pack.unitPriceLabel,
            }),
          },
        ]
      : []),
  ];
  // The header turns into the product card once most of the big picture has scrolled away.
  const revealAt = Math.round(((width - space[3] * 2) / GALLERY_RATIO) * 0.75);

  // Opens the phone's own share sheet with a line about the product. Cancelling it, or a phone with nothing to
  // share to, is not an error worth showing.
  const shareProduct = async () => {
    try {
      await Share.share({
        message: t('product.shareMessage', {
          name: item.name,
          pack: pack.label,
          price: formatRupees(pack.price),
          shop: item.shopName,
          link: Linking.createURL(`/product/${item.id}`),
        }),
      });
    } catch {
      // Nothing to do: the shopper closed the sheet, or this phone cannot share.
    }
  };

  const openShop = () => {
    router.push({ pathname: '/shop/[id]', params: { id: item.shop } });
  };

  return (
    <View style={styles.page}>
      <ProductHeader
        name={item.name}
        emoji={item.emoji}
        tint={tintOf(item.category)}
        price={pack.price}
        {...(pack.mrp !== undefined ? { mrp: pack.mrp } : {})}
        deliveryLabel={t('home.rails.today', { window: t('home.header.sampleWindow') })}
        addressLabel={t('home.header.fullAddress')}
        backLabel={t('common.back')}
        searchLabel={t('home.search.hintLabel')}
        shareLabel={t('product.share')}
        look={headerLook}
        onDeliveryPress={toggleHeaderLook}
        onBack={onBack}
        onSearch={() => {
          router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
        }}
        onShare={() => {
          void shareProduct();
        }}
        scrollY={scrollY}
        revealAt={revealAt}
      />
      <View style={styles.body}>
        <Animated.View
          style={[styles.fill, { opacity: reveal }]}
          pointerEvents={loaded ? 'auto' : 'none'}
        >
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: true,
            })}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: dock + ACTION_HEIGHT + space[6] + (cart.count > 0 ? CART_ROOM : 0) },
            ]}
          >
            <View style={styles.gutter}>
              <ProductGallery
                images={item.images}
                initialWidth={width - space[3] * 2}
                tint={tintOf(item.category)}
                photoLabel={(position, total) => t('product.photoOf', { n: position, total })}
                faded={out}
                overlay={
                  <>
                    {pack.ribbon !== undefined && !out ? (
                      <View style={styles.ribbon}>
                        <DiscountRibbon
                          amount={pack.ribbon.amount}
                          offLabel={pack.ribbon.offLabel}
                        />
                      </View>
                    ) : null}
                    <ProductInsight
                      title={t('product.insight.title')}
                      rows={insightRows}
                      openLabel={t('product.insight.open')}
                      closeLabel={t('product.insight.close')}
                    />
                  </>
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
                    expanded
                      ? [...details.highlights, ...details.moreHighlights]
                      : details.highlights
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
                  title={t('product.popularIn', {
                    category: t(`home.categories.${item.category}`),
                  })}
                >
                  {similar.map((other) => (
                    <ItemTile key={other.id} item={other} width={RAIL_CARD_WIDTH} />
                  ))}
                </ProductRail>
              </View>
            ) : null}
          </Animated.ScrollView>
        </Animated.View>
        {skeletonOn ? (
          <Animated.View
            style={[
              styles.cover,
              { opacity: reveal.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
            ]}
            pointerEvents="none"
          >
            <ProductSkeleton
              label={t('common.loading')}
              item={item}
              rails={[...(more.length > 0 ? [true] : []), ...(similar.length > 0 ? [false] : [])]}
            />
          </Animated.View>
        ) : null}
      </View>
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
