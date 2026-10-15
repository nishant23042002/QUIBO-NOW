import { formatRupees, money } from '@quibo/contracts';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { AccentWash, Chip, LetteredTitle, Text, radius, space } from '@/ui';
import { anyCardNote, useHomeListing } from './items';
import { PRICE_TILE_WIDTH, PriceTile } from './PriceTile';
import { PRICE_TIERS, pickUnder, priceBand } from './priceTiers';

/** The depth of a chosen price store's hard edge, as the stamped look of the price badge. */
const EDGE = 4;

/** The filter chips: all, then the broad categories Home's rows use. Each is a label key and the category it keeps. */
export const PRICE_FILTERS = [
  { key: 'all', label: 'home.categories.all' },
  { key: 'dairy', label: 'home.categories.dairy' },
  { key: 'vegetables', label: 'home.categories.vegetables' },
  { key: 'fruits', label: 'home.categories.fruits' },
  { key: 'staples', label: 'home.categories.staples' },
  { key: 'snacks', label: 'home.categories.snacks' },
] as const;

export type PriceFilterKey = (typeof PRICE_FILTERS)[number]['key'];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // The block sits on a lilac wash with a curved top and a fine edge: the same treatment as Fresh today's, in its own tint.
    module: {
      paddingTop: space[6],
      paddingBottom: space[6],
      gap: space[3],
      borderTopLeftRadius: radius.section,
      borderTopRightRadius: radius.section,
      overflow: 'hidden',
    },
    stores: {
      flexDirection: 'row',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingRight: space[4] + EDGE,
    },
    store: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: space[2],
      paddingHorizontal: space[1],
      borderRadius: radius.lg,
      borderWidth: 2,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    storeOn: {
      borderColor: c.action,
      borderBottomWidth: EDGE,
      borderRightWidth: EDGE,
    },
    chips: { flexDirection: 'row', gap: space[2], paddingHorizontal: space[4] },
    row: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    pad: { paddingHorizontal: space[4] },
  });

/**
 * "Small prices" (ADR 0047, ADR 0055 step 6): three price stores as big buttons, each a band (up to ₹30, ₹30 to ₹50, ₹50 to ₹100,
 * so a store holds what the one below does not), a row of
 * filter chips (all, dairy, vegetables, fruits, staples, snacks) and one swipeable row of price-first cards, cheapest first. The
 * title is a lettered word with a sticker, on a pistachio wash. Nothing in it loads or moves: choosing a store or a filter only
 * swaps the row. The tiers and the picking rule are the same as before; only how they are chosen has changed.
 */
export function SmallPrices() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const items = useHomeListing();
  const [chosen, setChosen] = useState(1);
  const [filter, setFilter] = useState<PriceFilterKey>('all');
  // Each store is a band: above the one before it and up to its own number, so a store never repeats what the one below shows.
  const band = priceBand(chosen);
  const picked = pickUnder(items, band.upTo, {
    above: band.above,
    ...(filter === 'all' ? {} : { category: filter }),
  });
  const note = anyCardNote(picked);
  const amount = (tier: number) => formatRupees(money(tier));

  return (
    <View style={styles.module} aria-label={t('home.smallPrices.title')}>
      <AccentWash tone="lilac" />
      <LetteredTitle
        word={t('home.smallPrices.word')}
        sticker={t('home.smallPrices.sticker')}
        sub={t('home.smallPrices.sub')}
      />
      <View style={styles.stores} role="tablist" aria-label={t('home.smallPrices.title')}>
        {PRICE_TIERS.map((tier, index) => {
          const on = index === chosen;
          const below = priceBand(index).above;
          const range = t('home.smallPrices.between', { from: amount(below), to: amount(tier) });
          return (
            <Pressable
              key={tier}
              role="tab"
              aria-selected={on}
              aria-label={
                index === 0 ? t('home.smallPrices.under', { amount: amount(tier) }) : range
              }
              onPress={() => {
                setChosen(index);
              }}
              style={[styles.store, on && styles.storeOn]}
            >
              <Text variant="hero" maxFontSizeMultiplier={1.3} numberOfLines={1}>
                {amount(tier)}
              </Text>
              <Text variant="caption" color={on ? 'ink' : 'inkMuted'} numberOfLines={1}>
                {index === 0 ? t('home.smallPrices.store') : range}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        aria-label={t('home.smallPrices.filter')}
      >
        <View style={styles.chips} role="group">
          {PRICE_FILTERS.map((entry) => (
            <Chip
              key={entry.key}
              light
              label={t(entry.label)}
              selected={filter === entry.key}
              onPress={() => {
                setFilter(entry.key);
              }}
            />
          ))}
        </View>
      </ScrollView>
      {picked.length === 0 ? (
        <View style={styles.pad}>
          <Text variant="small" color="inkMuted">
            {chosen === 0
              ? t('home.smallPrices.empty', { amount: amount(band.upTo) })
              : t('home.smallPrices.emptyBetween', {
                  from: amount(band.above),
                  to: amount(band.upTo),
                })}
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.row}>
            {picked.map((item) => (
              <PriceTile key={item.id} item={item} width={PRICE_TILE_WIDTH} reserveNote={note} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
