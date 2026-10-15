import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  BrandMark,
  Chip,
  Icon,
  Notice,
  ProductCardSkeleton,
  SkeletonScope,
  Text,
  radius,
  space,
  useChromeScroll,
} from '@/ui';
import { itemsOfBrand, kindsOfBrand, shopsOfBrand } from './brandPage';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { rowCardContent } from './cardContent';
import { ItemTile, gridCardWidth } from './ItemTile';
import { useHomeItems } from './items';

/** How long the loading skeleton shows when a brand page opens, as real items would take to arrive. */
const LOAD_MS = 200;
const MARK_WIDTH = 112;
const MARK_HEIGHT = 80;
/** How many cards of the grid the skeleton draws: a screen and a little over. */
const SKELETON_CARDS = 6;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[4], paddingTop: space[4] },
    gutter: { paddingHorizontal: space[4] },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    text: { flex: 1, minWidth: 0, gap: 2 },
    chips: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
    empty: { alignItems: 'center', gap: space[2], paddingVertical: space[8] },
  });

/**
 * A brand's own page (ADR 0036): the brand first (its letter, how many products it has here and how many shops sell it), a row of the
 * kinds it makes to filter by, then its items in the two-column grid the shop page uses. The cart bar works here as it does on Home,
 * because the cart is the same one. The brand is read from the items, so a brand with no items is never offered a page.
 */
export function BrandView({ brandId }: { brandId: string }) {
  const { t } = useLanguage();
  const chromeScroll = useChromeScroll();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width: screen } = useWindowDimensions();
  const cart = useCart();
  const online = useOnline();
  const all = useHomeItems();
  const items = itemsOfBrand(all, brandId);
  const brand = items[0]?.brand;
  const kinds = kindsOfBrand(items);
  const [kind, setKind] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (brand === undefined) return null;
  const shown = kind === null ? items : items.filter((item) => item.type === kind);
  const shops = shopsOfBrand(items);
  const width = gridCardWidth(screen);

  return (
    <View style={styles.page}>
      <ScrollView
        {...chromeScroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + BOTTOM_BAR_HEIGHT + space[6] + (cart.count > 0 ? CART_ROOM : 0),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {online ? null : (
          <View style={styles.gutter}>
            <Notice tone="warning" icon="wifiOff" message={t('state.offline.banner')} />
          </View>
        )}
        <View style={styles.gutter}>
          <View
            style={styles.card}
            accessible
            aria-label={`${brand.name}. ${
              items.length === 1
                ? t('brandPage.productsOne')
                : t('brandPage.products', { count: items.length })
            }. ${shops === 1 ? t('brandPage.soldByOne') : t('brandPage.soldBy', { count: shops })}`}
          >
            <BrandMark
              brandId={brand.id}
              mark={brand.mark}
              width={MARK_WIDTH}
              height={MARK_HEIGHT}
              rounded={radius.lg}
              inset={space[2]}
            />
            <View style={styles.text}>
              <Text variant="heading" role="heading">
                {brand.name}
              </Text>
              <Text variant="small" color="inkMuted">
                {items.length === 1
                  ? t('brandPage.productsOne')
                  : t('brandPage.products', { count: items.length })}
              </Text>
              <Text variant="small" color="inkMuted">
                {shops === 1 ? t('brandPage.soldByOne') : t('brandPage.soldBy', { count: shops })}
              </Text>
            </View>
          </View>
        </View>
        {kinds.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            aria-label={t('brandPage.filter')}
          >
            <Chip
              label={t('brandPage.all')}
              selected={kind === null}
              onPress={() => {
                setKind(null);
              }}
            />
            {kinds.map((entry) => (
              <Chip
                key={entry.type}
                label={entry.name}
                selected={kind === entry.type}
                onPress={() => {
                  setKind(entry.type);
                }}
              />
            ))}
          </ScrollView>
        ) : null}
        {!loaded ? (
          // The grid's first cards, each as tall as its real one.
          <SkeletonScope label={t('common.loading')}>
            <View style={styles.grid}>
              {(shown.length > 0
                ? shown.slice(0, SKELETON_CARDS)
                : Array.from({ length: SKELETON_CARDS }, () => undefined)
              ).map((item, index) => (
                <ProductCardSkeleton
                  key={item?.id ?? index}
                  width={width}
                  {...(item !== undefined ? { content: rowCardContent([item]).content } : {})}
                />
              ))}
            </View>
          </SkeletonScope>
        ) : shown.length === 0 ? (
          <View style={[styles.empty, styles.gutter]}>
            <Icon name="store" color={colors.inkMuted} size={40} />
            <Text variant="heading">{t('shop.empty.title')}</Text>
            <Text color="inkMuted" align="center">
              {t('shop.empty.body')}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {shown.map((item) => (
              <ItemTile key={item.id} item={item} width={width} />
            ))}
          </View>
        )}
      </ScrollView>
      <CartLayer follow bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
