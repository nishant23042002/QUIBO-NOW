import { formatRupees, money } from '@quibo/contracts';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Button, FilterButton, Icon, Sheet, Text, radius, space } from '@/ui';
import {
  NO_FILTERS,
  SORT_KEYS,
  activeFilterCount,
  applyFilters,
  chosenIn,
  isOnOffer,
  toggleValue,
  type Browsable,
  type CategoryFilters,
  type FacetReader,
  type SortKey,
} from './categoryFilters';
import { PRICE_TIERS } from './priceTiers';

/** One filter of the screen: its name, and for a filter of values the choices with how many items each has. */
export interface FilterPane {
  /** `price` and `properties` are drawn by the toolbar itself; every other id is a value filter with `options`. */
  id: string;
  label: string;
  options: readonly { id: string; label: string; count: number }[];
}

export interface CategoryToolbarProps<T extends Browsable> {
  /** The items the filters narrow (the chosen kind's items, before filtering). The sheet counts what a choice would leave. */
  items: readonly T[];
  /** The filters this category offers, in order. */
  panes: readonly FilterPane[];
  /** What an item has for a value filter. */
  read: FacetReader<T>;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
}

/** How wide the sheet's list of filters is. */
const PANE_RAIL = 116;
const BOX = 24;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingHorizontal: space[3],
      paddingVertical: space[2],
    },
    scroller: { flexGrow: 0, flexShrink: 0 },
    // The sort sheet: one row per choice, the round mark at the left like the radio buttons of a form. No lines between the rows.
    option: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingHorizontal: space[5],
    },
    radio: {
      width: BOX,
      height: BOX,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.action,
    },
    radioDot: { width: 12, height: 12, borderRadius: radius.full, backgroundColor: c.action },
    // The filters sheet: the list of filters at the left, the choices of the one open at the right.
    panes: { flex: 1, flexDirection: 'row' },
    // A scroll view grows to share the row by default; this one keeps its width.
    rail: {
      width: PANE_RAIL,
      flexGrow: 0,
      flexShrink: 0,
      backgroundColor: c.bg,
      borderRightWidth: 1,
      borderRightColor: c.line,
    },
    railItem: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      paddingLeft: space[4],
      paddingRight: space[3],
    },
    railItemOn: { backgroundColor: c.surface },
    railBar: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: c.action,
    },
    dot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: c.action },
    choices: { flex: 1 },
    choice: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    choiceText: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space[1] },
    box: {
      width: BOX,
      height: BOX,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: c.action,
    },
    boxOn: { backgroundColor: c.action },
    footer: { flexDirection: 'row', gap: space[3] },
    grow: { flex: 1, minWidth: 0 },
    shrink: { flexShrink: 1, minWidth: 0 },
  });

/**
 * The row above a category's grid and the two sheets it opens, the way Blinkit lays them out: buttons for Filters, Sort and then each
 * of the category's own filters (each drawn chosen when it is doing something). Sort is a list of radio choices with no lines between
 * them. Filters is a list of the filters at the left and the choices of the open one at the right, each with how many items it has,
 * and a button at the bottom that applies them and says how many items they leave. A filter's own button opens the same sheet at it.
 */
export function CategoryToolbar<T extends Browsable>({
  items,
  panes,
  read,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
}: CategoryToolbarProps<T>) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pane, setPane] = useState<string>(panes[0]?.id ?? 'price');
  // What the Filters sheet is changing; it only takes effect when the shopper presses Apply.
  const [draft, setDraft] = useState<CategoryFilters>(filters);

  const open = (which: string) => {
    setDraft(filters);
    setPane(panes.some((entry) => entry.id === which) ? which : (panes[0]?.id ?? 'price'));
    setFiltersOpen(true);
  };
  const amount = (tier: number) => formatRupees(money(tier));
  const withCount = (label: string, count: number) => (count > 0 ? `${label} · ${count}` : label);

  const total = activeFilterCount(filters);
  const left = applyFilters(items, draft, read).length;
  const countWhere = (test: (item: T) => boolean) => items.filter(test).length;
  const propertyCount = (value: CategoryFilters) =>
    (value.diet !== null ? 1 : 0) + (value.offersOnly ? 1 : 0);

  const check = (label: string, count: number, checked: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      role="checkbox"
      aria-checked={checked}
      aria-label={`${label} (${count})`}
      onPress={onPress}
      style={styles.choice}
    >
      <View style={styles.choiceText}>
        <View style={styles.shrink}>
          <Text variant={checked ? 'strong' : 'body'} numberOfLines={2}>
            {label}
          </Text>
        </View>
        <Text color="inkMuted">{`(${count})`}</Text>
      </View>
      <View style={[styles.box, checked && styles.boxOn]} aria-hidden>
        {checked ? <Icon name="check" color={colors.onAction} size={16} /> : null}
      </View>
    </Pressable>
  );

  const choices = () => {
    if (pane === 'price') {
      return PRICE_TIERS.map((tier) =>
        check(
          t('catalogue.filters.under', { amount: amount(tier) }),
          countWhere((item) => item.price <= tier),
          draft.maxPrice === tier,
          () => {
            setDraft({ ...draft, maxPrice: draft.maxPrice === tier ? null : tier });
          },
        ),
      );
    }
    if (pane === 'properties') {
      return [
        check(
          t('catalogue.filters.veg'),
          countWhere((item) => item.diet.kind === 'veg'),
          draft.diet === 'veg',
          () => {
            setDraft({ ...draft, diet: draft.diet === 'veg' ? null : 'veg' });
          },
        ),
        check(
          t('catalogue.filters.nonveg'),
          countWhere((item) => item.diet.kind === 'nonveg'),
          draft.diet === 'nonveg',
          () => {
            setDraft({ ...draft, diet: draft.diet === 'nonveg' ? null : 'nonveg' });
          },
        ),
        check(t('catalogue.filters.onOffer'), countWhere(isOnOffer), draft.offersOnly, () => {
          setDraft({ ...draft, offersOnly: !draft.offersOnly });
        }),
      ];
    }
    const current = panes.find((entry) => entry.id === pane);
    return (current?.options ?? []).map((option) =>
      check(option.label, option.count, (draft.values[pane] ?? []).includes(option.id), () => {
        setDraft(toggleValue(draft, pane, option.id));
      }),
    );
  };

  /** A dot beside a filter in the sheet's list when the draft has a choice in it. */
  const hasDot = (which: string): boolean => {
    if (which === 'price') return draft.maxPrice !== null;
    if (which === 'properties') return propertyCount(draft) > 0;
    return chosenIn(draft, which) > 0;
  };

  /** The count shown on a filter's button in the row. */
  const buttonLabel = (entry: FilterPane): string => {
    if (entry.id === 'price') {
      return filters.maxPrice === null
        ? entry.label
        : t('catalogue.filters.under', { amount: amount(filters.maxPrice) });
    }
    if (entry.id === 'properties') return withCount(entry.label, propertyCount(filters));
    return withCount(entry.label, chosenIn(filters, entry.id));
  };
  const buttonOn = (entry: FilterPane): boolean => {
    if (entry.id === 'price') return filters.maxPrice !== null;
    if (entry.id === 'properties') return propertyCount(filters) > 0;
    return chosenIn(filters, entry.id) > 0;
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroller}
        contentContainerStyle={styles.row}
        aria-label={t('catalogue.filters.title')}
      >
        <FilterButton
          icon="filter"
          dropdown
          label={withCount(t('catalogue.filters.chip'), total)}
          selected={total > 0}
          onPress={() => {
            open(panes[0]?.id ?? 'price');
          }}
        />
        <FilterButton
          icon="sort"
          dropdown
          label={sort === 'relevance' ? t('catalogue.sort.chip') : t(`catalogue.sort.${sort}`)}
          selected={sort !== 'relevance'}
          onPress={() => {
            setSortOpen(true);
          }}
        />
        {panes.map((entry) => (
          <FilterButton
            key={entry.id}
            dropdown
            label={buttonLabel(entry)}
            selected={buttonOn(entry)}
            onPress={() => {
              open(entry.id);
            }}
          />
        ))}
      </ScrollView>

      <Sheet
        open={sortOpen}
        onClose={() => {
          setSortOpen(false);
        }}
        title={t('catalogue.sort.title')}
        closeLabel={t('catalogue.filters.close')}
        ruled={false}
      >
        {SORT_KEYS.map((key) => (
          <Pressable
            key={key}
            role="radio"
            aria-checked={sort === key}
            aria-label={t(`catalogue.sort.${key}`)}
            onPress={() => {
              onSortChange(key);
              setSortOpen(false);
            }}
            style={styles.option}
          >
            <View style={styles.radio} aria-hidden>
              {sort === key ? <View style={styles.radioDot} /> : null}
            </View>
            <Text variant={sort === key ? 'strong' : 'body'}>{t(`catalogue.sort.${key}`)}</Text>
          </Pressable>
        ))}
      </Sheet>

      <Sheet
        open={filtersOpen}
        onClose={() => {
          setFiltersOpen(false);
        }}
        title={t('catalogue.filters.title')}
        closeLabel={t('catalogue.filters.close')}
        heightPercent={72}
        bare
        footer={
          <View style={styles.footer}>
            <View style={styles.grow}>
              <Button
                variant="secondary"
                label={t('catalogue.filters.clearAll')}
                onPress={() => {
                  setDraft(NO_FILTERS);
                }}
              />
            </View>
            <View style={styles.grow}>
              <Button
                label={t('catalogue.filters.apply', { count: left })}
                disabled={left === 0}
                onPress={() => {
                  onFiltersChange(draft);
                  setFiltersOpen(false);
                }}
              />
            </View>
          </View>
        }
      >
        <View style={styles.panes}>
          <ScrollView style={styles.rail} showsVerticalScrollIndicator={false}>
            {panes.map((entry) => (
              <Pressable
                key={entry.id}
                role="tab"
                aria-selected={pane === entry.id}
                onPress={() => {
                  setPane(entry.id);
                }}
                style={[styles.railItem, pane === entry.id && styles.railItemOn]}
              >
                <View style={styles.grow}>
                  <Text variant={pane === entry.id ? 'strong' : 'body'} numberOfLines={2}>
                    {entry.label}
                  </Text>
                </View>
                {hasDot(entry.id) ? <View style={styles.dot} aria-hidden /> : null}
                {pane === entry.id ? <View style={styles.railBar} /> : null}
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView style={styles.choices}>{choices()}</ScrollView>
        </View>
      </Sheet>
    </>
  );
}
