import { formatRupees } from '@quibo/contracts';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Notice, SectionDivider, ShopHero, Text, radius, space } from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { FREE_DELIVERY_FROM } from './delivery';
import { HomeSkeleton } from './HomeSkeleton';
import { ItemDetailHost, ItemTile, gridCardWidth } from './ItemTile';
import { useHomeItems, type ItemCategory } from './items';
import type { ShopDetails } from './sampleShops';

/** How long the loading skeleton shows when a shop page opens, as real items would take to arrive. */
const LOAD_MS = 500;

/** The order a shop's categories come in. */
const ORDER: readonly ItemCategory[] = ['dairy', 'vegetables', 'fruits', 'staples', 'snacks'];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[5], paddingTop: space[4] },
    gutter: { paddingHorizontal: space[4] },
    free: {
      gap: space[2],
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    track: { height: 4, borderRadius: radius.full, backgroundColor: c.line },
    fill: { height: 4, borderRadius: radius.full, backgroundColor: c.accentEdge },
    section: { gap: space[3] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
    empty: { alignItems: 'center', gap: space[2], paddingVertical: space[8] },
  });

/**
 * A shop's own page: the shop first, then free delivery (which counts the whole cart, not this shop alone), then
 * its items in a two-column grid under a title for each category. The cart bar and the item sheet work here as
 * they do on Home, because the cart is the same one. A shop with no items says so; a closed shop says when it opens.
 */
export function ShopView({ shop }: { shop: ShopDetails }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width: screen } = useWindowDimensions();
  const cart = useCart();
  const items = useHomeItems().filter((item) => item.shop === shop.id);
  const [loaded, setLoaded] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const width = gridCardWidth(screen);
  const sections = ORDER.map((key) => ({
    key,
    items: items.filter((item) => item.category === key),
  })).filter((section) => section.items.length > 0);

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + space[6] + (cart.count > 0 ? CART_ROOM : 0) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gutter}>
          <ShopHero
            name={shop.name}
            type={shop.type}
            statusLabel={shop.statusLabel}
            open={shop.open}
            verifiedLabel={shop.verifiedLabel}
            facts={[
              { icon: 'clock', label: shop.hoursLabel },
              { icon: 'store', label: shop.sinceLabel },
              { icon: 'shield', label: shop.verifiedLabel },
            ]}
          />
        </View>
        {shop.open ? null : (
          <View style={styles.gutter}>
            <Notice
              tone="info"
              icon="clock"
              message={t('shop.closedNote', { time: t('home.shopsSheet.sample.opensTime') })}
            />
          </View>
        )}
        <View style={styles.gutter}>
          <View style={styles.free} accessible aria-label={cart.hint}>
            <View style={styles.track} aria-hidden>
              <View style={[styles.fill, { width: `${Math.round(cart.progress * 100)}%` }]} />
            </View>
            <Text variant="strong" color={cart.free ? 'accentInk' : 'inkMuted'}>
              {t('shop.freeDelivery', { amount: formatRupees(FREE_DELIVERY_FROM) })}
            </Text>
          </View>
        </View>
        {!loaded ? (
          <HomeSkeleton label={t('common.loading')} grid />
        ) : sections.length === 0 ? (
          <View style={[styles.empty, styles.gutter]}>
            <Icon name="store" color={colors.inkMuted} size={40} />
            <Text variant="heading">{t('shop.empty.title')}</Text>
            <Text color="inkMuted" align="center">
              {t('shop.empty.body')}
            </Text>
          </View>
        ) : (
          sections.map((section, index) => (
            <View key={section.key} style={styles.section}>
              {index > 0 ? <SectionDivider /> : null}
              <View style={styles.gutter}>
                <Text variant="subheading" role="heading">
                  {t(`home.rails.${section.key}`)}
                </Text>
              </View>
              <View style={styles.grid}>
                {section.items.map((item) => (
                  <ItemTile key={item.id} item={item} width={width} onOpen={setDetailId} />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <CartLayer bottom={insets.bottom} />
      <ItemDetailHost
        id={detailId}
        onClose={() => {
          setDetailId(null);
        }}
      />
    </View>
  );
}
