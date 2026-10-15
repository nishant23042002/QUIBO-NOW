import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  CategoryHeader,
  Chip,
  LoadGate,
  Notice,
  ProductCardSkeleton,
  ProductRail,
  RowTitleSkeleton,
  Skeleton,
  SkeletonScope,
  StatePanel,
  Text,
  chipWidthOf,
  radius,
  space,
  useChromeScroll,
  useScreenLoad,
} from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { rowCardContent } from './cardContent';
import { tintColor } from './categoryGroups';
import { needSections, type Need } from './needs';
import { useDeliveryWhen } from './deliveryInfo';
import { ItemTile, RAIL_CARD_WIDTH, gridCardWidth } from './ItemTile';
import { anyCardNote, useHomeItems } from './items';
import { CATEGORIES_LOAD_MS, CATEGORIES_POLICY } from './loading';

const CHIP_HEIGHT = 36;
const SKELETON_SHELVES = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[5] },
    gutter: { paddingHorizontal: space[4] },
    // The page's own colour, as a band under the header with a square lower edge: the need's name large, and a line under it.
    band: {
      gap: space[1],
      paddingHorizontal: space[4],
      paddingTop: space[4],
      paddingBottom: space[5],
    },
    chips: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
    shelves: { gap: space[6] },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], paddingHorizontal: space[4] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    section: { gap: space[3] },
    skeleton: { flex: 1, overflow: 'hidden' },
    empty: { minHeight: 320 },
  });

/** The need's name on a band of its colour, and the line under it: known before anything loads, so the skeleton shows it as is. */
function NeedBand({ need }: { need: Need }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.band, { backgroundColor: tintColor(colors, need.tint) }]}>
      <Text variant="title" color="ink" role="heading">
        {t(need.label)}
      </Text>
      <Text color="inkMuted">{t('needs.band')}</Text>
    </View>
  );
}

/**
 * The page's layout in grey: the band as it is, the chips for the shelves when there is more than one, then the shelves, each
 * with a title as long as the real one and a row of cards as tall as the real row. The same band, gaps and rows as the page, so
 * each lands where its real one will.
 */
function NeedSkeleton({ need }: { need: Need }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { width: screen } = useWindowDimensions();
  const sections = needSections(useHomeItems(), need);
  const across = Math.ceil((screen - space[4]) / (RAIL_CARD_WIDTH + space[3]));

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <NeedBand need={need} />
      <View style={[styles.content, { paddingTop: space[4] }]}>
        {sections.length > 1 ? (
          <View style={styles.chips}>
            {[t('catalogue.all'), ...sections.map((section) => t(section.label))].map(
              (chip, index) => (
                <Skeleton
                  key={index}
                  width={chipWidthOf(chip)}
                  height={CHIP_HEIGHT}
                  rounded={radius.md}
                />
              ),
            )}
          </View>
        ) : null}
        <View style={styles.shelves}>
          {sections.slice(0, SKELETON_SHELVES).map((section) => (
            <View key={section.id} style={styles.section}>
              <View style={styles.gutter}>
                <RowTitleSkeleton title={t(section.label)} />
              </View>
              <View style={styles.row}>
                {Array.from(
                  { length: Math.max(1, Math.min(across, section.items.length)) },
                  (_, card) => (
                    <ProductCardSkeleton
                      key={card}
                      width={RAIL_CARD_WIDTH}
                      {...rowCardContent(section.items)}
                    />
                  ),
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </SkeletonScope>
  );
}

function NeedPage({ need }: { need: Need }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const chromeScroll = useChromeScroll();
  const { width: screen } = useWindowDimensions();
  const cart = useCart();
  const online = useOnline();
  const sections = needSections(useHomeItems(), need);
  // The shelf chosen in the chip row, or null for all of them.
  const [shelf, setShelf] = useState<string | null>(null);
  const chosen = sections.find((section) => section.id === shelf);
  const width = gridCardWidth(screen);

  return (
    <ScrollView
      {...chromeScroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom:
          insets.bottom + BOTTOM_BAR_HEIGHT + space[6] + (cart.count > 0 ? CART_ROOM : 0),
      }}
    >
      <NeedBand need={need} />
      <View style={[styles.content, { paddingTop: space[4] }]}>
        {online ? null : (
          <View style={styles.gutter}>
            <Notice tone="warning" icon="wifiOff" message={t('state.offline.banner')} />
          </View>
        )}
        {sections.length === 0 ? (
          <View style={styles.empty}>
            <StatePanel icon="search" title={t('needs.empty.title')} body={t('needs.empty.body')} />
          </View>
        ) : (
          <>
            {sections.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
                aria-label={t('needs.rail')}
              >
                <Chip
                  label={t('catalogue.all')}
                  selected={chosen === undefined}
                  onPress={() => {
                    setShelf(null);
                  }}
                />
                {sections.map((section) => (
                  <Chip
                    key={section.id}
                    label={t(section.label)}
                    selected={chosen?.id === section.id}
                    onPress={() => {
                      setShelf(section.id);
                    }}
                  />
                ))}
              </ScrollView>
            ) : null}
            {chosen !== undefined ? (
              <View style={styles.grid}>
                {chosen.items.map((item) => (
                  <ItemTile key={item.id} item={item} width={width} />
                ))}
              </View>
            ) : (
              <View style={styles.shelves}>
                {sections.map((section) => {
                  // Cards in a row stay one height: room for the low-stock line only when one of them has it.
                  const note = anyCardNote(section.items);
                  return (
                    <ProductRail key={section.id} title={t(section.label)}>
                      {section.items.map((item) => (
                        <ItemTile
                          key={item.id}
                          item={item}
                          width={RAIL_CARD_WIDTH}
                          reserveNote={note}
                        />
                      ))}
                    </ProductRail>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

/**
 * A need's own page (ADR 0044): the need's name on a band of its colour, a row of chips for the shelves it gathers (milk, sugar,
 * biscuits ...), and under it a swipeable row of items for each shelf, or one shelf as a grid. The cart bar works here as on Home.
 * It has its loading, offline (the items are kept on the phone, so it still shows, with a notice) and failed states, an empty state
 * when nothing for it is in stock, and the header stays put through them.
 */
export function NeedView({ need }: { need: Need }) {
  const { t } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const when = useDeliveryWhen();
  const load = useScreenLoad({ loadMs: CATEGORIES_LOAD_MS, policy: CATEGORIES_POLICY });

  return (
    <View style={styles.page}>
      <CategoryHeader
        title={t(need.label)}
        subtitle={when.headline}
        backLabel={t('common.back')}
        onBack={() => {
          // Opened straight from an address there is nothing behind it: go Home instead.
          if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
        searchLabel={t('catalogue.searchLabel')}
        onSearch={() => {
          router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
        }}
      />
      <LoadGate load={load} skeleton={<NeedSkeleton need={need} />}>
        <NeedPage need={need} />
      </LoadGate>
      <CartLayer follow bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
