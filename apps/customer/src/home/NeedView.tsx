import { useRouter } from 'expo-router';
import { useRef } from 'react';
import {
  Text as NativeText,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { MomentTheme, useStyles, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  CategoryHeader,
  Chip,
  LoadGate,
  Notice,
  ProductCardSkeleton,
  ProductRail,
  RowTitleSkeleton,
  Skeleton,
  SkeletonLine,
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
import { needSections, sectionHint, type Need } from './needs';
import { useDeliveryWhen } from './deliveryInfo';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { anyCardNote, useHomeItems } from './items';
import { CATEGORIES_LOAD_MS, CATEGORIES_POLICY } from './loading';
import { useNotify } from './useNotify';

const CHIP_HEIGHT = 36;
/** The chip bar's own padding, above and below the chips; the bar sticks under the header, and a jump leaves this much room for it. */
const CHIP_BAR_PAD = space[3];
const CHIP_BAR_HEIGHT = CHIP_HEIGHT + CHIP_BAR_PAD * 2;
const SKELETON_SHELVES = 3;
/** About how wide a character of a hint is, so its skeleton line is as long as the real one. */
const HINT_LETTER = 7;
const ART_SIZE = 72;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[5] },
    gutter: { paddingHorizontal: space[4] },
    // The moment's own colour as a band under the header with a square lower edge: its name large, a line, and a picture.
    band: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[4],
      paddingTop: space[4],
      paddingBottom: space[5],
      backgroundColor: c.lilac,
    },
    bandText: { flex: 1, minWidth: 0, gap: space[1] },
    art: {
      width: ART_SIZE,
      height: ART_SIZE,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.line,
    },
    // The chips stay under the header while the shelves scroll, on the page's colour so nothing shows through them.
    chipBar: { backgroundColor: c.bg, paddingVertical: CHIP_BAR_PAD },
    chips: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
    shelves: { gap: space[6] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    section: { gap: space[3] },
    sectionHead: { gap: space[1] },
    soon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      marginHorizontal: space[4],
      padding: space[3],
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    soonText: { flex: 1, minWidth: 0 },
    skeleton: { flex: 1, overflow: 'hidden' },
    empty: { minHeight: 320 },
  });

/**
 * The moment's name on a band of its own colour, the line under it, where the items come from, and its picture: known before
 * anything loads, so the skeleton shows it as is.
 */
function NeedBand({ need }: { need: Need }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.band}>
      <View style={styles.bandText}>
        <Text variant="title" color="ink" role="heading">
          {t(need.label)}
        </Text>
        <Text color="inkMuted">{t(need.line)}</Text>
        <Text variant="small" color="inkMuted">
          {t('needs.band')}
        </Text>
      </View>
      <View style={styles.art} aria-hidden>
        <NativeText allowFontScaling={false} style={{ fontSize: 40, lineHeight: 50 }}>
          {need.emoji}
        </NativeText>
      </View>
    </View>
  );
}

/**
 * The page's layout in grey: the band as it is, the jump chips when there is more than one shelf, then the shelves, each with a
 * title (and its hint) as long as the real ones and a row of cards as tall as the real row. The same band, gaps and rows as the
 * page, so each lands where its real one will.
 */
function NeedSkeleton({ need }: { need: Need }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { width: screen } = useWindowDimensions();
  const sections = needSections(useHomeItems(), need);
  const across = Math.ceil((screen - space[4]) / (RAIL_CARD_WIDTH + space[3]));
  const hasChips = sections.length > 1;

  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <NeedBand need={need} />
      {hasChips ? (
        <View style={styles.chipBar}>
          <View style={styles.chips}>
            {sections.map((section) => (
              <Skeleton
                key={section.id}
                width={chipWidthOf(t(section.label))}
                height={CHIP_HEIGHT}
                rounded={radius.md}
              />
            ))}
          </View>
        </View>
      ) : null}
      <View style={[styles.content, { paddingTop: hasChips ? space[2] : space[4] }]}>
        <View style={styles.shelves}>
          {sections.slice(0, SKELETON_SHELVES).map((section) => {
            const hintKey = sectionHint(need, section);
            return (
              <View key={section.id} style={styles.section}>
                <View style={styles.sectionHead}>
                  <View style={styles.gutter}>
                    <RowTitleSkeleton title={t(section.label)} />
                  </View>
                  {hintKey !== undefined ? (
                    <View style={styles.gutter}>
                      <SkeletonLine
                        size="sm"
                        width={Math.min(240, [...t(hintKey)].length * HINT_LETTER)}
                      />
                    </View>
                  ) : null}
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
            );
          })}
        </View>
      </View>
    </SkeletonScope>
  );
}

/** What the moment wants that the town does not stock yet: a quiet row with Notify me, shared with the Categories tab. */
function SoonRow({ need }: { need: Need }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const notify = useNotify();
  const soon = need.soon;
  if (soon === undefined) return null;
  const on = notify.has(soon.id);

  return (
    <View style={styles.soon}>
      <View style={styles.soonText}>
        <Text variant="label" color="ink">
          {t(soon.label)}
        </Text>
        <Text variant="small" color="inkMuted">
          {t('needs.soon.line')}
        </Text>
      </View>
      <Button
        label={on ? t('catalogue.notify.on') : t('catalogue.notify.me')}
        variant={on ? 'secondary' : 'primary'}
        onPress={() => {
          notify.toggle(soon.id);
        }}
      />
    </View>
  );
}

function NeedPage({ need }: { need: Need }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const chromeScroll = useChromeScroll();
  const cart = useCart();
  const online = useOnline();
  const sections = needSections(useHomeItems(), need);
  const hasChips = sections.length > 1;
  const scroller = useRef<ScrollView>(null);
  // Where each part sits (a View's `y` is within its parent), so a chip can scroll to its shelf.
  const place = useRef<{ content: number; shelves: number; shelf: Record<string, number> }>({
    content: 0,
    shelves: 0,
    shelf: {},
  });

  const jump = (id: string) => {
    const at = place.current;
    const y = at.content + at.shelves + (at.shelf[id] ?? 0);
    scroller.current?.scrollTo({ y: Math.max(0, y - CHIP_BAR_HEIGHT), animated: true });
  };

  return (
    <ScrollView
      ref={scroller}
      {...chromeScroll}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={hasChips ? [1] : []}
      contentContainerStyle={{
        paddingBottom:
          insets.bottom + BOTTOM_BAR_HEIGHT + space[6] + (cart.count > 0 ? CART_ROOM : 0),
      }}
    >
      <NeedBand need={need} />
      {hasChips ? (
        <View style={styles.chipBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            aria-label={t('needs.rail')}
          >
            {sections.map((section) => (
              <Chip
                key={section.id}
                label={t(section.label)}
                onPress={() => {
                  jump(section.id);
                }}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
      <View
        style={[styles.content, { paddingTop: hasChips ? space[2] : space[4] }]}
        onLayout={(event) => {
          place.current.content = event.nativeEvent.layout.y;
        }}
      >
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
          <View
            style={styles.shelves}
            onLayout={(event) => {
              place.current.shelves = event.nativeEvent.layout.y;
            }}
          >
            {sections.map((section) => {
              // Cards in a row stay one height: room for the low-stock line only when one of them has it.
              const note = anyCardNote(section.items);
              const hintKey = sectionHint(need, section);
              return (
                <View
                  key={section.id}
                  onLayout={(event) => {
                    place.current.shelf[section.id] = event.nativeEvent.layout.y;
                  }}
                >
                  <ProductRail
                    title={t(section.label)}
                    {...(hintKey !== undefined ? { hint: t(hintKey) } : {})}
                  >
                    {section.items.map((item) => (
                      <ItemTile
                        key={item.id}
                        item={item}
                        width={RAIL_CARD_WIDTH}
                        reserveNote={note}
                      />
                    ))}
                  </ProductRail>
                </View>
              );
            })}
          </View>
        )}
        <SoonRow need={need} />
      </View>
    </ScrollView>
  );
}

function NeedScreen({ need }: { need: Need }) {
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

/**
 * A moment's own page (ADR 0044 and the moments plan), in the moment's own colours from the header to the background: its name on
 * a band, a row of chips that jump to the shelves it gathers (Dairy, Biscuits ...), and under it a swipeable row of items for each
 * shelf, every brand on every shelf, with a quiet line for what the town does not stock yet. The cart bar works here as on Home.
 * It has its loading, offline (the items are kept on the phone, so it still shows, with a notice) and failed states, an empty state
 * when nothing for it is in stock, and the header stays put through them.
 */
export function NeedView({ need }: { need: Need }) {
  return (
    <MomentTheme id={need.id}>
      <NeedScreen need={need} />
    </MomentTheme>
  );
}
