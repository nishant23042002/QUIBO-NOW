import { formatRupees, subtract } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import {
  Animated,
  Easing,
  Pressable,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { loadOutcome, useOnline } from '@/network';
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
  Notice,
  PackPicker,
  PriceBadge,
  ProductGallery,
  ProductInsight,
  ProductRail,
  StatePanel,
  Stepper,
  Text,
  TrustTiles,
  WEIGHT_RULE,
  countRule,
  radius,
  space,
  useChromeProgress,
  useChromeReport,
  type InsightPage,
} from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';
import { ZONE } from './delivery';
import { useDeliveryAddress, useDeliveryWhen } from './deliveryInfo';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { ProductHeader } from './ProductHeader';
import { ProductSkeleton } from './ProductSkeleton';
import { ACTION_HEIGHT, makePageStyles } from './productLayout';
import { anyCardNote, useHomeItems, type HomeItem } from './items';
import { moreFromShop, similarItems } from './product';
import { useProductDetails } from './productDetails';
import { useShop } from './sampleShops';

/** How long the loading skeleton shows when the page opens, as real data would take to arrive. */
const LOAD_MS = 150;
/** The ADD bar slides in and out on the bottom bar's own curve, a little quicker on the way out. */
const BAR_IN_MS = 260;
const BAR_OUT_MS = 200;
const BAR_EASE = Easing.bezier(0.4, 0, 0.2, 1);
/** Once the ADD bar is showing, the page has to come back this far before it goes, so a small wobble at the edge cannot flicker it. */
const BAR_HYSTERESIS = 24;
/** How many rows of the information card show before "View more". */
const INFORMATION_SHOWN = 3;
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
    hidden: { opacity: 0 },
    packRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    fact: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    shop: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    shopIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.lilac,
    },
    shopText: { flex: 1, minWidth: 0 },
    pressed: { opacity: 0.8 },
    action: {
      position: 'absolute',
      left: 0,
      right: 0,
      minHeight: ACTION_HEIGHT,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[3],
      paddingVertical: space[2],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
    // The price block takes what the control leaves, but not less than a readable line.
    actionInfo: { flexGrow: 1, flexShrink: 1, flexBasis: 120, minWidth: 0 },
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
export function ProductView({
  item,
  onBack,
  onOpenRelated,
}: {
  item: HomeItem;
  onBack: () => void;
  /** An item in one of this page's rows was opened: the page remembers this one so back can return to it. */
  onOpenRelated: () => void;
}) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCart();
  const when = useDeliveryWhen();
  const address = useDeliveryAddress();
  const tintOf = useTintOf();
  const items = useHomeItems();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const hideBar = useChromeProgress();
  const reportScroll = useChromeReport();
  // The ADD bar only shows once the price and ADD in the page itself have scrolled out of sight, so the same control is never on
  // screen twice. `inlineEnd` is where that row ends, from three measurements; `barIn` is 0 hidden to 1 shown, on the animation thread.
  const [barShown, setBarShown] = useState(false);
  const [barIn] = useState(() => new Animated.Value(0));
  const [inline, setInline] = useState({ section: 0, card: 0, row: 0, height: 0 });

  // Remembers where the page's own price row is, changing state only when a measurement actually changes.
  const measure = (key: keyof typeof inline, value: number) => {
    setInline((current) => (current[key] === value ? current : { ...current, [key]: value }));
  };

  const onPageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      // Scrolling down hides the bottom bar and brings the cart bar down to its small form, as on Home.
      if (!reduceMotion) reportScroll(y);
      // The ADD bar comes once the page's own price and ADD are out of sight, and goes when they are back. State changes only
      // when the answer changes, not on every frame of the scroll.
      const end = inline.section + inline.card + inline.row + inline.height;
      const past = inline.height > 0 && y >= (barShown ? end - BAR_HYSTERESIS : end);
      if (past !== barShown) setBarShown(past);
    },
    [reduceMotion, reportScroll, inline, barShown],
  );

  useEffect(() => {
    if (reduceMotion) {
      barIn.setValue(barShown ? 1 : 0);
      return undefined;
    }
    const slide = Animated.timing(barIn, {
      toValue: barShown ? 1 : 0,
      duration: barShown ? BAR_IN_MS : BAR_OUT_MS,
      easing: BAR_EASE,
      useNativeDriver: true,
    });
    slide.start();
    return () => {
      slide.stop();
    };
  }, [barShown, reduceMotion, barIn]);
  const online = useOnline();
  // loading, then ready; or offline / failed, with a way to try again.
  const [phase, setPhase] = useState<'loading' | 'ready' | 'offline' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  const loaded = phase === 'ready';
  // Nothing to show: there is no network or the load failed. The price bar goes too, since the price may be out of date.
  const blocked = phase === 'offline' || phase === 'failed';
  // 0 while the skeleton shows, 1 once the real page has faded in over it. The skeleton goes when the fade is done.
  const [reveal] = useState(() => new Animated.Value(0));
  const [skeletonOn, setSkeletonOn] = useState(true);
  const [expanded, setExpanded] = useState(false);
  // The information card shows its first rows until opened, like the highlights.
  const [infoOpen, setInfoOpen] = useState(false);
  // How tall the price and ADD bar really is, so the page's end and the cart bar clear it at any text size.
  const [actionHeight, setActionHeight] = useState(ACTION_HEIGHT);
  // The insight card covers most of the picture while it is open, so the saving ribbon steps aside.
  const [insightOpen, setInsightOpen] = useState(false);
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
      const outcome = loadOutcome();
      const next = outcome === 'ok' ? 'ready' : outcome === 'offline' ? 'offline' : 'failed';
      // A page that has loaded stays up if the network drops later (it shows a notice instead); and when the network
      // comes back while the offline screen shows, the page loads by itself.
      setPhase((current) => (current === 'ready' ? current : next));
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [item.id, attempt, online]);

  // Try again: back to the skeleton, and load once more.
  const retry = () => {
    reveal.setValue(0);
    setSkeletonOn(true);
    setPhase('loading');
    setAttempt((current) => current + 1);
  };

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
  const allInformation = [...details.information, ...details.seller];
  const similar = similarItems(items, item);
  const saved =
    pack.mrp !== undefined && pack.mrp > pack.price ? subtract(pack.mrp, pack.price) : undefined;
  const dock = insets.bottom + BOTTOM_BAR_HEIGHT;
  // The bottom bar slides away as the page is read. The ADD bar slides down by as much, so it rests on the bottom edge and there is
  // no gap, and the cart bar shrinks into its small form just above it. With "reduce motion" on the bars stay where they are.
  const followsBar = !reduceMotion;
  const barDrop = hideBar.interpolate({ inputRange: [0, 1], outputRange: [0, BOTTOM_BAR_HEIGHT] });
  // Hidden, the ADD bar sits below its place, behind the bottom bar; shown, it is where it was. It also drops with the bottom bar.
  const awayBy = actionHeight + insets.bottom + space[2];
  const barSlide = followsBar
    ? Animated.add(barDrop, barIn.interpolate({ inputRange: [0, 1], outputRange: [awayBy, 0] }))
    : barIn.interpolate({ inputRange: [0, 1], outputRange: [awayBy, 0] });
  const cartLift = barIn.interpolate({ inputRange: [0, 1], outputRange: [0, -actionHeight] });
  const stepper = {
    addLabel: t('home.rails.add'),
    addAriaLabel: t('home.rails.addNamed', { name: item.name }),
    decreaseLabel: t('home.rails.removeOneOf', { name: item.name }),
    increaseLabel: t('home.rails.addOneOf', { name: item.name }),
    maxLabel: t('home.rails.noMore'),
    rule: pack.loose === true ? WEIGHT_RULE : countRule(pack.maxQuantity),
    ...(pack.loose === true ? { unitLabel: t('weights.kg') } : {}),
  };

  // The picture's insight card: only the facts that apply to this product and size.
  const { glance } = details;
  // The pages, in this order: what a helping holds, a tip (with what it is good for), what to check when it arrives,
  // and what it costs per unit (only when there are sizes to compare).
  const insightPages: InsightPage[] = [
    ...(glance.nutrition !== undefined
      ? [
          {
            kind: 'nutrition' as const,
            tab: t('product.insight.tabNutrition'),
            caption: t('product.insight.labelNutrition', { serving: glance.nutrition.serving }),
            energy: glance.nutrition.energy,
            macros: glance.nutrition.macros,
          },
        ]
      : []),
    ...(glance.tip !== undefined
      ? [
          {
            kind: 'tip' as const,
            tab: t('product.insight.tabTip'),
            title: t('product.insight.labelTip'),
            text: glance.tip,
            extras:
              glance.goodFor !== undefined
                ? [{ label: t('product.insight.labelGood'), value: glance.goodFor }]
                : [],
          },
        ]
      : []),
    {
      kind: 'check',
      tab: t('product.insight.tabCheck'),
      title: t('product.insight.labelCheck'),
      body: glance.check,
    },
    // Only when there are several sizes to compare.
    ...(pack.unitPriceLabel !== undefined
      ? [
          {
            kind: 'value' as const,
            tab: t('product.insight.tabValue'),
            caption: t('product.insight.labelValue'),
            unit: pack.unitPriceLabel,
            sizes: item.packs
              .filter((option) => option.unitPriceLabel !== undefined)
              .map((option) => ({
                label: option.label,
                value: option.unitPriceLabel ?? '',
                current: option.id === pack.id,
                ...(option.bestValue ? { tag: t('product.bestValue') } : {}),
              })),
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
        deliveryLabel={when.short}
        addressLabel={address}
        backLabel={t('common.back')}
        searchLabel={t('home.search.hintLabel')}
        shareLabel={t('product.share')}
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
      {blocked ? (
        <View style={styles.body}>
          <StatePanel
            icon={phase === 'offline' ? 'wifiOff' : 'close'}
            title={phase === 'offline' ? t('state.offline.title') : t('state.error.title')}
            body={phase === 'offline' ? t('state.offline.body') : t('state.error.body')}
            actionLabel={t('state.retry')}
            onAction={retry}
          />
        </View>
      ) : (
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
                listener: onPageScroll,
              })}
              contentContainerStyle={[
                styles.content,
                {
                  paddingBottom: dock + actionHeight + space[6] + (cart.count > 0 ? CART_ROOM : 0),
                },
              ]}
            >
              {online ? null : (
                <View style={styles.gutter}>
                  <Notice tone="warning" icon="wifiOff" message={t('state.offline.banner')} />
                </View>
              )}
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
                        <View style={[styles.ribbon, insightOpen && styles.hidden]}>
                          <DiscountRibbon
                            amount={pack.ribbon.amount}
                            offLabel={pack.ribbon.offLabel}
                          />
                        </View>
                      ) : null}
                      <ProductInsight
                        title={t('product.insight.title')}
                        pages={insightPages}
                        openLabel={t('product.insight.open')}
                        closeLabel={t('product.insight.close')}
                        onOpenChange={setInsightOpen}
                      />
                    </>
                  }
                />
              </View>
              <View
                style={styles.gutter}
                onLayout={(event) => {
                  measure('section', event.nativeEvent.layout.y);
                }}
              >
                <View
                  style={styles.card}
                  onLayout={(event) => {
                    measure('card', event.nativeEvent.layout.y);
                  }}
                >
                  <View style={styles.packRow}>
                    <DietMark kind={item.diet.kind} label={item.diet.label} size={18} />
                    <Text variant="small" color="inkMuted">
                      {item.diet.label}
                    </Text>
                  </View>
                  <Text variant="title">{item.name}</Text>
                  <Text color="inkMuted">
                    {pack.loose === true
                      ? t('weights.netLine')
                      : t('product.netQuantity', { pack: pack.label })}
                  </Text>
                  <View
                    style={styles.priceRow}
                    onLayout={(event) => {
                      measure('row', event.nativeEvent.layout.y);
                      measure('height', event.nativeEvent.layout.height);
                    }}
                  >
                    <PriceBadge
                      amount={pack.price}
                      {...(pack.mrp !== undefined ? { mrp: pack.mrp } : {})}
                    />
                    {out ? (
                      <Text variant="strong" color="inkMuted">
                        {pack.stock?.label}
                      </Text>
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
                  {saved !== undefined ? (
                    <Text variant="strong" color="accentInk">
                      {t('product.save', { amount: formatRupees(saved) })}
                    </Text>
                  ) : null}
                  <Text variant="small" color="inkMuted">
                    {t('product.taxes')}
                  </Text>
                  {pack.loose === true ? (
                    <Text variant="small" color="inkMuted">
                      {t('weights.pdpNote', { percent: ZONE.weights.tolerancePercent })}
                    </Text>
                  ) : null}
                  {pack.stock?.kind === 'low' ? (
                    <Text variant="strong" color="warning">
                      {pack.maxQuantity !== undefined && quantity >= pack.maxQuantity
                        ? t('product.allInCart', { count: pack.maxQuantity })
                        : pack.stock.label}
                    </Text>
                  ) : null}
                  {pack.quick === true && !out ? (
                    <View style={styles.fact}>
                      <Icon name="clock" color={colors.accentInk} size={18} />
                      <Text variant="strong">{when.short}</Text>
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
                        inCart: cart.quantities[option.id] ?? 0,
                        ...((cart.quantities[option.id] ?? 0) > 0
                          ? {
                              inCartLabel: t('product.inCart', {
                                count: cart.quantities[option.id] ?? 0,
                              }),
                            }
                          : {}),
                        ...(option.available
                          ? {}
                          : { unavailableLabel: t('home.rails.outOfStock') }),
                      }))}
                    />
                  </View>
                </View>
              ) : null}
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
                  <FactTable
                    rows={infoOpen ? allInformation : allInformation.slice(0, INFORMATION_SHOWN)}
                  />
                  {allInformation.length > INFORMATION_SHOWN ? (
                    <Pressable
                      role="button"
                      aria-expanded={infoOpen}
                      aria-label={infoOpen ? t('product.viewLess') : t('product.viewMore')}
                      onPress={() => {
                        setInfoOpen((current) => !current);
                      }}
                      style={({ pressed }) => [styles.more, pressed && styles.pressed]}
                    >
                      <Text variant="strong" color="accentInk">
                        {infoOpen ? t('product.viewLess') : t('product.viewMore')}
                      </Text>
                      <View style={infoOpen ? styles.flipped : undefined}>
                        <Icon name="chevron" color={colors.accentInk} size={16} />
                      </View>
                    </Pressable>
                  ) : null}
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
                    <Icon name="store" color={colors.action} size={20} />
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
                      <ItemTile
                        key={other.id}
                        item={other}
                        width={RAIL_CARD_WIDTH}
                        reserveNote={anyCardNote(more)}
                        onOpen={onOpenRelated}
                      />
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
                      <ItemTile
                        key={other.id}
                        item={other}
                        width={RAIL_CARD_WIDTH}
                        reserveNote={anyCardNote(similar)}
                        onOpen={onOpenRelated}
                      />
                    ))}
                  </ProductRail>
                </View>
              ) : null}
              <View style={styles.gutter}>
                <View style={[styles.card, styles.section]}>
                  <CardTitle>{t('product.trust.title')}</CardTitle>
                  <TrustTiles
                    scroll
                    bleed={space[4]}
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
      )}
      {blocked ? null : (
        <Animated.View
          pointerEvents={barShown ? 'auto' : 'none'}
          aria-hidden={!barShown}
          style={[styles.action, { bottom: dock, transform: [{ translateY: barSlide }] }]}
          onLayout={(event) => {
            setActionHeight(Math.round(event.nativeEvent.layout.height));
          }}
        >
          {/* What it is, in one quiet line over the price: the size and how many are in the cart come first, so a long name is the part that gets cut. */}
          <View style={styles.actionInfo}>
            <Text variant="fine" color="inkMuted" numberOfLines={1}>
              {[
                pack.label,
                ...(quantity > 0 && pack.loose !== true
                  ? [t('product.inCart', { count: quantity })]
                  : []),
                item.name,
              ].join(' · ')}
            </Text>
            <PriceBadge
              amount={pack.price}
              {...(pack.mrp !== undefined ? { mrp: pack.mrp } : {})}
            />
          </View>
          {out ? (
            <Text variant="strong" color="inkMuted">
              {pack.stock?.label}
            </Text>
          ) : quantity === 0 ? (
            <View style={styles.add}>
              <Button
                label={t('home.rails.add')}
                onPress={() => {
                  cart.setQuantity(pack.id, stepper.rule.min);
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
        </Animated.View>
      )}
      {/* The cart bar rests above the bottom bar while the ADD bar is away, and rides up above it as it comes. */}
      <Animated.View
        pointerEvents="box-none"
        style={[StyleSheet.absoluteFill, { transform: [{ translateY: cartLift }] }]}
      >
        <CartLayer follow={followsBar} bottom={dock} />
      </Animated.View>
    </View>
  );
}
