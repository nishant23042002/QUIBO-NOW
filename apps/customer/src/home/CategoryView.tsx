import type { MessageKey } from '@quibo/i18n';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  CategoryHeader,
  Icon,
  Notice,
  ProductCardSkeleton,
  SkeletonScope,
  SUB_RAIL_WIDTH,
  SubCategoryRail,
  Text,
  gridCardWidth,
  mixColor,
  space,
  useChromeScroll,
} from '@/ui';
import { CART_ROOM, CartLayer } from './CartLayer';
import { useCart } from './CartProvider';
import { itemsInCategory, subCategory, subsWithItems, type MainCategory } from './catalogueTree';
import { tintColor } from './categoryGroups';
import {
  NO_FILTERS,
  applyFilters,
  effectiveFilters,
  sortItems,
  type CategoryFilters,
  type SortKey,
} from './categoryFilters';
import { CategoryToolbar, type FilterPane } from './CategoryToolbar';
import {
  MAIN_FACETS,
  facetOptions,
  facetValues,
  isValueFacet,
  type FacetOption,
  type ValueFacet,
} from './facets';
import { useDeliveryWhen } from './deliveryInfo';
import { rowCardContent } from './cardContent';
import { ItemTile } from './ItemTile';
import { anyCardNote, useHomeItems, type HomeItem } from './items';

/** How long the loading skeleton shows when a category opens, as real items would take to arrive. */
const LOAD_MS = 250;
/** The room at the sides of the grid and between its cards, which is tighter than Home's because the rail takes a share. */
const GUTTER = space[3];
const GAP = space[2];
/** How many cards of the grid the skeleton draws: enough to fill a screen and a little over. */
const SKELETON_CARDS = 6;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    body: { flex: 1, flexDirection: 'row' },
    right: { flex: 1, minWidth: 0 },
    gutter: { paddingHorizontal: GUTTER },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: GUTTER },
    empty: { alignItems: 'center', gap: space[2], paddingVertical: space[8] },
  });

/** The words that name a choice in a value filter: a size as it is written, a brand or kind by name, the rest from the message files. */
function optionLabel(
  facet: ValueFacet,
  option: FacetOption,
  t: (key: MessageKey) => string,
): string {
  switch (facet) {
    case 'quantity':
      return option.id;
    case 'brand':
      return option.sample.brand?.name ?? option.id;
    case 'type':
      return option.sample.name;
    case 'origin':
      return t(`product.origin.${option.id}` as MessageKey);
    case 'fat':
    case 'source':
    case 'processing':
      return t(`product.attr.${option.id}` as MessageKey);
  }
}

/**
 * A main category's own screen (Vegetables & Fruits, Dairy & Eggs): a lilac header, a left rail of its kinds ("All" first) and its
 * items in a two-column grid on the category's own colour. Choosing a kind in the rail narrows the grid. Every brand of a kind is
 * listed here (Home lists one), because this is where a shopper compares. The cart bar and the bottom bar work as on Home.
 */
export function CategoryView({
  main,
  initialSub,
}: {
  main: MainCategory;
  /** The kind to open on, from the address: a sub-category id, or nothing for "All". */
  initialSub?: string;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const chromeScroll = useChromeScroll();
  const insets = useSafeAreaInsets();
  const { width: screen } = useWindowDimensions();
  const cart = useCart();
  const online = useOnline();
  const when = useDeliveryWhen();
  const items = useHomeItems();
  const [loaded, setLoaded] = useState(false);
  const scroller = useRef<ScrollView>(null);

  const subs = subsWithItems(items, main);
  const startSub = subs.find((sub) => sub.id === initialSub)?.id ?? null;
  const [chosen, setChosen] = useState<string | null>(startSub);
  const active = subs.find((sub) => sub.id === chosen);
  const ofKind = itemsInCategory(
    items,
    main,
    active === undefined ? undefined : subCategory(main, active.id),
  );
  // Sort and filters are the shopper's, and carry across the kinds in the rail; a brand the chosen kind does not have is ignored.
  const [sort, setSort] = useState<SortKey>('relevance');
  const [filters, setFilters] = useState<CategoryFilters>(NO_FILTERS);
  // The filters this category offers, in its own order: a filter of values is left out when the list has fewer than two to choose from.
  const panes: FilterPane[] = MAIN_FACETS[main.id].flatMap((id): FilterPane[] => {
    const label = t(`catalogue.filters.${id}`);
    if (!isValueFacet(id)) return [{ id, label, options: [] }];
    const options = facetOptions(ofKind, id);
    if (options.length < 2) return [];
    return [
      {
        id,
        label,
        options: options.map((option) => ({
          id: option.id,
          count: option.count,
          label: optionLabel(id, option, t),
        })),
      },
    ];
  });
  const read = (item: HomeItem, facet: string): string[] =>
    isValueFacet(facet as ValueFacet | 'price' | 'properties')
      ? facetValues(item, facet as ValueFacet)
      : [];
  const applied = effectiveFilters(
    filters,
    Object.fromEntries(panes.map((pane) => [pane.id, pane.options.map((option) => option.id)])),
  );
  const shown = sortItems(applyFilters(ofKind, applied, read), sort);
  // There are items of this kind, and the filters leave none of them.
  const filtered = ofKind.length > 0 && shown.length === 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, LOAD_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // A kind chosen in the rail shows from the top of its list.
  useEffect(() => {
    scroller.current?.scrollTo({ y: 0, animated: false });
  }, [chosen, sort, filters]);

  // The right-hand side wears the category's colour, lightened so the pictures (which sit on the full tint) stand out from it.
  const wash = mixColor(tintColor(colors, main.tint), colors.bg, 0.55);
  // The grid fills what the rail leaves, with a gutter on each side and a gap between the two cards.
  const cardWidth = gridCardWidth(screen - SUB_RAIL_WIDTH, {
    columns: 2,
    gutter: GUTTER,
    gap: GAP,
  });
  const note = anyCardNote(shown);

  return (
    <View style={styles.page}>
      <CategoryHeader
        title={t(main.label)}
        subtitle={when.headline}
        backLabel={t('common.back')}
        onBack={() => {
          // Opened straight from an address there is nothing behind it: go to the Categories tab instead.
          if (router.canGoBack()) router.back();
          else router.replace('/categories');
        }}
        searchLabel={t('catalogue.searchLabel')}
        onSearch={() => {
          router.push({ pathname: '/search', params: { fresh: String(Date.now()) } });
        }}
      />
      <View style={styles.body}>
        {/* The rail is the page's own as soon as it opens: what the kinds are is known before the items arrive. */}
        <SubCategoryRail
          label={t('catalogue.rail')}
          selected={chosen}
          onSelect={setChosen}
          items={[
            { id: null, label: t('catalogue.all'), emoji: main.emoji },
            ...subs.map((sub) => ({ id: sub.id, label: t(sub.label), emoji: sub.emoji })),
          ]}
        />
        <View style={[styles.right, { backgroundColor: wash }]}>
          {/* So is the toolbar: its buttons are the category's, whatever the grid under it is doing. */}
          <CategoryToolbar
            items={ofKind}
            panes={panes}
            read={read}
            sort={sort}
            onSortChange={setSort}
            filters={applied}
            onFiltersChange={setFilters}
          />
          <ScrollView
            ref={scroller}
            {...chromeScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: space[3],
              paddingBottom:
                insets.bottom + BOTTOM_BAR_HEIGHT + space[6] + (cart.count > 0 ? CART_ROOM : 0),
            }}
          >
            {online ? null : (
              <View style={[styles.gutter, { paddingBottom: space[3] }]}>
                <Notice tone="warning" icon="wifiOff" message={t('state.offline.banner')} />
              </View>
            )}
            {!loaded ? (
              <SkeletonScope label={t('common.loading')}>
                <View style={styles.grid}>
                  {/* The cards the grid will start with, each as tall as its real one: its name's lines and its extra line. */}
                  {(shown.length > 0
                    ? shown.slice(0, SKELETON_CARDS)
                    : Array.from({ length: SKELETON_CARDS }, () => undefined)
                  ).map((item, index) => (
                    <ProductCardSkeleton
                      key={item?.id ?? index}
                      width={cardWidth}
                      reserveNote={note}
                      {...(item !== undefined ? { content: rowCardContent([item]).content } : {})}
                    />
                  ))}
                </View>
              </SkeletonScope>
            ) : filtered ? (
              <View style={[styles.empty, styles.gutter]}>
                <Icon name="search" color={colors.inkMuted} size={40} />
                <Text variant="heading" align="center">
                  {t('catalogue.filters.noMatch.title')}
                </Text>
                <Text color="inkMuted" align="center">
                  {t('catalogue.filters.noMatch.body')}
                </Text>
                <Button
                  variant="secondary"
                  label={t('catalogue.filters.noMatch.clear')}
                  onPress={() => {
                    setFilters(NO_FILTERS);
                  }}
                />
              </View>
            ) : shown.length === 0 ? (
              <View style={[styles.empty, styles.gutter]}>
                <Icon name="store" color={colors.inkMuted} size={40} />
                <Text variant="heading" align="center">
                  {t('catalogue.empty.title')}
                </Text>
                <Text color="inkMuted" align="center">
                  {t('catalogue.empty.body')}
                </Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {shown.map((item) => (
                  <ItemTile key={item.id} item={item} width={cardWidth} reserveNote={note} />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      <CartLayer follow bottom={insets.bottom + BOTTOM_BAR_HEIGHT} />
    </View>
  );
}
