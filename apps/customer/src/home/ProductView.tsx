import { formatRupees, subtract } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  type ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { loadOutcome, useOnline } from '@/network';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { useReduceMotion } from '@/ui/useReduceMotion';
import {
  BOTTOM_BAR_HEIGHT,
  BrandFooter,
  BrandTile,
  DetailSection,
  DiscountRibbon,
  FactChip,
  HighlightsStrip,
  Icon,
  Notice,
  PackPicker,
  PriceBadge,
  BrandMark,
  OtherBrandsButton,
  ProductInsight,
  ProductRail,
  ProductStage,
  STAGE_RATIO,
  Sheet,
  StatePanel,
  TintPill,
  Stepper,
  Text,
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
import { PDP_TRIAL } from './pdpTrial';
import {
  brandsInCategory,
  cheaperPerUnit,
  otherBrands,
  similarItems,
  startingPackId,
} from './product';
import { useProductDetails } from './productDetails';
import { useShop } from './sampleShops';
import { noteViewed } from './useViewed';

/** How long the loading skeleton shows when the page opens, as real data would take to arrive. */
const LOAD_MS = 150;
/** The ADD bar slides in and out on the bottom bar's own curve, a little quicker on the way out. */
const BAR_IN_MS = 260;
const BAR_OUT_MS = 200;
const BAR_EASE = Easing.bezier(0.4, 0, 0.2, 1);
/** Once the ADD bar is showing, the page has to come back this far before it goes, so a small wobble at the edge cannot flicker it. */
const BAR_HYSTERESIS = 24;
/** How tall the details sheet opens, as a share of the screen, and stays. */
const SHEET_HEIGHT = 72;
/** How many of the highlights show as chips on the page; the rest are in the details sheet. */
const STRIP_CHIPS = 3;
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
    noticeTop: { paddingTop: space[3] },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    fact: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    meta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: space[4],
      rowGap: space[1],
    },
    divider: { height: 1, backgroundColor: c.line },
    alsoAt: { marginTop: space[1] },
    strip: { padding: space[3] },
    chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    sheetFooter: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    // The price, the saving and the tax line stack at the left; the ADD control keeps its place at the right.
    priceLeft: { flexShrink: 1, minWidth: 0, gap: space[1] },
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
    // The three rows as one card: a flush box with dividers between rows, the rows carrying the card's padding.
    groupCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
      overflow: 'hidden',
    },
    groupRow: { padding: space[4] },
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
    rail: { paddingBottom: space[2] },
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
  // The ADD bar only shows once the price and ADD in the page itself have scrolled out of sight above, so the same control is
  // never on screen twice and the bar is never there for nothing. `rowEnd` is where that row ends, from three measurements;
  // `barIn` is 0 hidden to 1 shown, on the animation thread.
  const [scrollShown, setScrollShown] = useState(false);
  const [barIn] = useState(() => new Animated.Value(0));
  const [inline, setInline] = useState({ section: 0, card: 0, row: 0, height: 0 });

  // Remembers where the page's own price row is, changing state only when a measurement actually changes.
  const measure = (key: keyof typeof inline, value: number) => {
    setInline((current) => (current[key] === value ? current : { ...current, [key]: value }));
  };

  const online = useOnline();
  // loading, then ready; or offline / failed, with a way to try again.
  const [phase, setPhase] = useState<'loading' | 'ready' | 'offline' | 'failed'>('loading');
  const [attempt, setAttempt] = useState(0);
  const loaded = phase === 'ready';
  // Nothing to show: there is no network or the load failed. The price bar goes too, since the price may be out of date.
  const blocked = phase === 'offline' || phase === 'failed';

  const rowEnd = inline.section + inline.card + inline.row + inline.height;
  const measured = loaded && inline.height > 0;
  const barShown = measured && scrollShown;

  const onPageScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      // Scrolling down hides the bottom bar and brings the cart bar down to its small form, as on Home.
      if (!reduceMotion) reportScroll(y);
      // The ADD bar comes once the page's own price and ADD are out of sight above, and goes when they are back. Once it is
      // showing, the row has to come back a little further before it goes, so a small wobble at the edge cannot flicker it.
      // State changes only when the answer changes, not on every frame of the scroll.
      setScrollShown(measured && y >= (barShown ? rowEnd - BAR_HYSTERESIS : rowEnd));
    },
    [reduceMotion, reportScroll, barShown, rowEnd, measured],
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
  // 0 while the skeleton shows, 1 once the real page has faded in over it. The skeleton goes when the fade is done.
  const [reveal] = useState(() => new Animated.Value(0));
  const [skeletonOn, setSkeletonOn] = useState(true);
  // The details sheet, and which of its sections are open: the key facts first, the rest on request.
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({ key: true, nutrition: false, info: false });
  // How tall the price and ADD bar really is, so the page's end and the cart bar clear it at any text size.
  const [actionHeight, setActionHeight] = useState(ACTION_HEIGHT);
  // The insight card covers most of the picture while it is open, so the saving ribbon steps aside.
  const [insightOpen, setInsightOpen] = useState(false);
  const [scrollY] = useState(() => new Animated.Value(0));
  // The page's scroll view, and where the "Other brands" row starts in it, so the button on the picture can take the shopper there.
  const scrollRef = useRef<ScrollView>(null);
  const othersAt = useRef(0);
  const shop = useShop(item.shop);
  // Opening a product is what "Continue browsing" on Home remembers (only its id).
  useEffect(() => {
    noteViewed(item.id);
  }, [item.id]);
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

  // The size chosen on this page; it starts as the best-value size, or the one the card showed (the trial switch).
  const [packId, setPackId] = useState(() => startingPackId(item, PDP_TRIAL.preselectBestValue));
  const pack = item.packs.find((candidate) => candidate.id === packId) ?? item.packs[0];
  if (pack === undefined) return null;
  const quantity = cart.quantities[pack.id] ?? 0;
  const out = pack.stock?.kind === 'out';
  // The picture's button: glide down to the other brands, leaving the row's title a little below the header. With "reduce motion" on it
  // simply moves there.
  const showOtherBrands = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, othersAt.current - space[3]),
      animated: !reduceMotion,
    });
  };
  // The same kind of product from other brands first; then what is popular in the category, without repeating those.
  const others = otherBrands(items, item);
  const brands = brandsInCategory(items, item.category);
  const similar = similarItems(items, item).filter(
    (candidate) => !others.some((other) => other.id === candidate.id),
  );
  // "Packed today" for fresh goods, "Packed yesterday" for one day old; older goods say nothing here (the sheet has the date).
  const packedLabel =
    details.packedDaysAgo === 0
      ? t('product.packedToday')
      : details.packedDaysAgo === 1
        ? t('product.packedYesterday')
        : undefined;
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
    addAriaLabel: t('home.rails.addNamed', { name: item.fullName }),
    decreaseLabel: t('home.rails.removeOneOf', { name: item.fullName }),
    increaseLabel: t('home.rails.addOneOf', { name: item.fullName }),
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
  // The header turns into the product card once most of the picture stage has scrolled away.
  const revealAt = Math.round((width / STAGE_RATIO) * 0.75);

  // Opens the phone's own share sheet with a line about the product. Cancelling it, or a phone with nothing to
  // share to, is not an error worth showing.
  const shareProduct = async () => {
    try {
      await Share.share({
        message: t('product.shareMessage', {
          name: item.fullName,
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

  // A kind of product opens search with its name already in the box; a brand opens its own page (ADR 0036).
  const openSearch = (query: string) => {
    router.push({ pathname: '/search', params: { fresh: String(Date.now()), q: query } });
  };
  const openBrandPage = (brandId: string) => {
    router.push({ pathname: '/brand/[id]', params: { id: brandId } });
  };
  const openBrand = () => {
    if (item.brand !== undefined) openBrandPage(item.brand.id);
  };

  // The three rows under the info card. Drawn as three cards, or (the trial switch) as the rows of one card with dividers.
  const brandOfItem = item.brand;
  const alsoAt =
    item.otherShops === undefined
      ? undefined
      : item.otherShops === 1
        ? t('product.alsoAtOne')
        : t('product.alsoAtMany', { count: item.otherShops });
  const soldByRow = (grouped: boolean) => (
    <Pressable
      role="button"
      aria-label={`${t('product.soldBy', { shop: item.shopName })}. ${t('product.openShop')}`}
      onPress={openShop}
      style={({ pressed }) => [
        grouped ? styles.groupRow : styles.card,
        styles.shop,
        pressed && styles.pressed,
      ]}
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
        {alsoAt === undefined ? null : PDP_TRIAL.singleGreen ? (
          <View style={styles.alsoAt}>
            <TintPill label={alsoAt} />
          </View>
        ) : (
          <Text variant="caption" color="accentInk" numberOfLines={1}>
            {alsoAt}
          </Text>
        )}
      </View>
      <Icon name="chevronRight" color={colors.accentInk} size={18} />
    </Pressable>
  );
  const brandRow = (grouped: boolean) =>
    brandOfItem === undefined ? null : (
      <Pressable
        role="button"
        aria-label={`${brandOfItem.name}. ${t('product.exploreAll')}`}
        onPress={openBrand}
        style={({ pressed }) => [
          grouped ? styles.groupRow : styles.card,
          styles.shop,
          pressed && styles.pressed,
        ]}
      >
        <BrandMark
          brandId={brandOfItem.id}
          mark={brandOfItem.mark}
          width={64}
          height={40}
          inset={space[2]}
          letter="label"
        />
        <View style={styles.shopText}>
          <Text variant="strong" numberOfLines={1}>
            {brandOfItem.name}
          </Text>
          <Text variant="small" color="inkMuted" numberOfLines={1}>
            {t('product.exploreAll')}
          </Text>
        </View>
        <Icon name="chevronRight" color={colors.accentInk} size={18} />
      </Pressable>
    );
  const replacementRow = (grouped: boolean) => (
    <View style={[grouped ? styles.groupRow : styles.card, styles.shop]} accessible>
      <View style={styles.shopIcon}>
        <Icon name="repeat" color={colors.action} size={20} />
      </View>
      <View style={styles.shopText}>
        <Text variant="strong">{t('product.replacementRow')}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.page}>
      <ProductHeader
        name={item.fullName}
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
              ref={scrollRef}
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
                <View style={[styles.gutter, styles.noticeTop]}>
                  <Notice tone="warning" icon="wifiOff" message={t('state.offline.banner')} />
                </View>
              )}
              <ProductStage
                images={item.images}
                tint={tintOf(item.category)}
                photoLabel={(position, total) => t('product.photoOf', { n: position, total })}
                faded={out}
                quiet={insightOpen}
                diet={item.diet}
                {...(pack.ribbon !== undefined && !out
                  ? {
                      ribbon: (
                        <DiscountRibbon
                          amount={pack.ribbon.amount}
                          offLabel={pack.ribbon.offLabel}
                        />
                      ),
                    }
                  : {})}
                {...(others.length > 0
                  ? {
                      others: (
                        <OtherBrandsButton
                          count={others.length}
                          label={t('product.otherBrandsButton', { count: others.length })}
                          onPress={showOtherBrands}
                        />
                      ),
                    }
                  : {})}
                insight={
                  <ProductInsight
                    title={t('product.insight.title')}
                    pages={insightPages}
                    openLabel={t('product.insight.open')}
                    closeLabel={t('product.insight.close')}
                    onOpenChange={setInsightOpen}
                  />
                }
              />
              <View style={styles.gutter}>
                <View style={[styles.card, styles.strip]}>
                  <HighlightsStrip
                    slim={PDP_TRIAL.singleGreen}
                    chips={details.highlights.slice(0, STRIP_CHIPS)}
                    actionLabel={t('product.viewDetails')}
                    onAction={() => {
                      // Each time the sheet opens it starts the same way: the key facts open, the rest shut.
                      setSectionsOpen({ key: true, nutrition: false, info: false });
                      setDetailsOpen(true);
                    }}
                  />
                </View>
              </View>
              <View
                style={styles.gutter}
                onLayout={(event) => {
                  measure('section', event.nativeEvent.layout.y);
                }}
              >
                <View
                  style={[styles.card, styles.section]}
                  onLayout={(event) => {
                    measure('card', event.nativeEvent.layout.y);
                  }}
                >
                  {out ? null : (
                    <View style={styles.meta}>
                      <View style={styles.fact}>
                        <Icon name="clock" color={colors.ink} size={16} />
                        <Text variant="caption">{when.short}</Text>
                      </View>
                      {packedLabel !== undefined ? (
                        PDP_TRIAL.singleGreen ? (
                          <TintPill icon="check" label={packedLabel} />
                        ) : (
                          <View style={styles.fact}>
                            <Icon name="check" color={colors.accentInk} size={16} />
                            <Text variant="caption" color="accentInk">
                              {packedLabel}
                            </Text>
                          </View>
                        )
                      ) : null}
                    </View>
                  )}
                  <Text variant="heading">{item.fullName}</Text>
                  {pack.loose === true ? (
                    <Text color="inkMuted">{t('weights.netLine')}</Text>
                  ) : null}
                  <PackPicker
                    tagTone={PDP_TRIAL.singleGreen ? 'soft' : 'solid'}
                    title={t('product.pickSize')}
                    selectedId={pack.id}
                    onSelect={setPackId}
                    options={item.packs.map((option) => ({
                      id: option.id,
                      label: option.label,
                      priceLabel: formatRupees(option.price),
                      ...(option.mrp !== undefined && option.mrp > option.price
                        ? { mrpLabel: formatRupees(option.mrp) }
                        : {}),
                      ...(PDP_TRIAL.sizeSavings &&
                      option.mrp !== undefined &&
                      option.mrp > option.price
                        ? {
                            saveLabel: t('product.saveShort', {
                              amount: formatRupees(subtract(option.mrp, option.price)),
                            }),
                          }
                        : {}),
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
                      ...(option.available ? {} : { unavailableLabel: t('home.rails.outOfStock') }),
                    }))}

                    {...(item.packs.length === 1
                      ? {
                          placeholder:
                            pack.loose === true
                              ? {
                                  title: t('product.anyWeightTitle'),
                                  body: t('product.anyWeightBody'),
                                }
                              : {
                                  title: t('product.otherSizesTitle'),
                                  body: t('product.otherSizesBody'),
                                },
                        }
                      : {})}
                  />
                  <View style={styles.divider} />
                  <View
                    style={styles.priceRow}
                    onLayout={(event) => {
                      measure('row', event.nativeEvent.layout.y);
                      measure('height', event.nativeEvent.layout.height);
                    }}
                  >
                    <View style={styles.priceLeft}>
                      <PriceBadge
                        amount={pack.price}
                        {...(pack.mrp !== undefined ? { mrp: pack.mrp } : {})}
                      />
                      {saved !== undefined ? (
                        <Text variant="caption" color="accentInk">
                          {t('product.save', { amount: formatRupees(saved) })}
                        </Text>
                      ) : null}
                      <Text variant="fine" color="inkMuted">
                        {t('product.taxes')}
                      </Text>
                    </View>
                    {out ? (
                      <Text variant="strong" color="inkMuted">
                        {pack.stock?.label}
                      </Text>
                    ) : (
                      <Stepper
                        large
                        value={quantity}
                        onChange={(next) => {
                          cart.setQuantity(pack.id, next);
                        }}
                        {...stepper}
                      />
                    )}
                  </View>
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
                </View>
              </View>
              {PDP_TRIAL.groupedRows ? (
                <View style={styles.gutter}>
                  <View style={styles.groupCard}>
                    {soldByRow(true)}
                    {brandOfItem !== undefined ? (
                      <>
                        <View style={styles.divider} />
                        {brandRow(true)}
                      </>
                    ) : null}
                    <View style={styles.divider} />
                    {replacementRow(true)}
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.gutter}>{soldByRow(false)}</View>
                  {brandOfItem !== undefined ? (
                    <View style={styles.gutter}>{brandRow(false)}</View>
                  ) : null}
                  <View style={styles.gutter}>{replacementRow(false)}</View>
                </>
              )}
              {others.length > 0 ? (
                <View
                  style={styles.rail}
                  onLayout={(event) => {
                    othersAt.current = event.nativeEvent.layout.y;
                  }}
                >
                  <ProductRail
                    title={t('product.otherBrands', { name: item.name.toLocaleLowerCase() })}
                    seeAllLabel={t('home.rails.seeAll')}
                    onSeeAll={() => {
                      openSearch(item.name);
                    }}
                  >
                    {others.map((other) => (
                      <ItemTile
                        key={other.id}
                        item={other}
                        width={RAIL_CARD_WIDTH}
                        reserveNote={anyCardNote(others)}
                        onOpen={onOpenRelated}
                        {...(PDP_TRIAL.unitPriceOnBrands && other.unit !== undefined
                          ? {
                              compare: {
                                label: other.unit.label,
                                better: cheaperPerUnit(other.unit, pack.unit),
                              },
                            }
                          : {})}
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
              {brands.length > 1 ? (
                <View style={styles.rail}>
                  <ProductRail title={t('product.brandsIn')}>
                    {brands.map((brand) => (
                      <BrandTile
                        key={brand.id}
                        brandId={brand.id}
                        mark={brand.mark}
                        name={brand.name}
                        label={`${brand.name}. ${t('product.exploreAll')}`}
                        onPress={() => {
                          openBrandPage(brand.id);
                        }}
                      />
                    ))}
                  </ProductRail>
                </View>
              ) : null}
              <BrandFooter />
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
                chips={details.highlights.slice(0, STRIP_CHIPS)}
                rails={[
                  ...(others.length > 0
                    ? [
                        {
                          kind: 'cards' as const,
                          title: t('product.otherBrands', { name: item.name.toLocaleLowerCase() }),
                          items: others,
                          seeAll: true,
                        },
                      ]
                    : []),
                  ...(similar.length > 0
                    ? [
                        {
                          kind: 'cards' as const,
                          title: t('product.popularIn', {
                            category: t(`home.categories.${item.category}`),
                          }),
                          items: similar,
                          seeAll: false,
                        },
                      ]
                    : []),
                  ...(brands.length > 1
                    ? [{ kind: 'brands' as const, title: t('product.brandsIn') }]
                    : []),
                ]}
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
                item.fullName,
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
          ) : (
            <Stepper
              large
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
      <Sheet
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
        }}
        title={item.fullName}
        largeTitle
        heightPercent={SHEET_HEIGHT}
        closeLabel={t('product.closeDetails')}
        footer={
          <View style={styles.sheetFooter}>
            <View style={styles.actionInfo}>
              <Text variant="fine" color="inkMuted" numberOfLines={1}>
                {pack.label}
              </Text>
              <PriceBadge
                amount={pack.price}
                {...(pack.mrp !== undefined ? { mrp: pack.mrp } : {})}
              />
              <Text variant="fine" color="inkMuted">
                {t('product.taxes')}
              </Text>
            </View>
            {out ? (
              <Text variant="strong" color="inkMuted">
                {pack.stock?.label}
              </Text>
            ) : (
              <Stepper
                large
                value={quantity}
                onChange={(next) => {
                  cart.setQuantity(pack.id, next);
                }}
                {...stepper}
              />
            )}
          </View>
        }
      >
        <Text variant="subheading" role="heading">
          {t('product.highlights')}
        </Text>
        <View style={styles.chipsWrap}>
          {details.highlights.map((chip) => (
            <FactChip key={chip.label} chip={chip} />
          ))}
        </View>
        <Text variant="subheading" role="heading">
          {t('product.allDetails')}
        </Text>
        <DetailSection
          title={t('product.keyInformation')}
          rows={details.keyInformation}
          open={sectionsOpen.key}
          onToggle={() => {
            setSectionsOpen((current) => ({ ...current, key: !current.key }));
          }}
        />
        {details.nutrition.length > 0 ? (
          <DetailSection
            title={t('product.nutritionalInformation')}
            rows={details.nutrition}
            open={sectionsOpen.nutrition}
            onToggle={() => {
              setSectionsOpen((current) => ({ ...current, nutrition: !current.nutrition }));
            }}
          />
        ) : null}
        <DetailSection
          title={t('product.information')}
          rows={details.info}
          open={sectionsOpen.info}
          onToggle={() => {
            setSectionsOpen((current) => ({ ...current, info: !current.info }));
          }}
        />
      </Sheet>
    </View>
  );
}
