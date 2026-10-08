import { LOCALES, messages } from '@quibo/i18n';
import { useMemo } from 'react';
import { useHomeItems, type ItemCategory } from './items';
import type { SearchDoc } from './search';

/**
 * The English-letter spellings people use for each item, until the mock API supplies them (Phase 1b). This is
 * the plan's `item_alias` table: a word, and which item it finds. Hindi and Marathi words in Devanagari need no
 * entry here, because every item is also searched by its name in all three languages.
 */
const ITEM_ALIASES: Readonly<Record<string, readonly string[]>> = {
  milk: ['milk', 'dudh', 'doodh', 'dood'],
  curd: ['curd', 'dahi', 'dahee', 'yogurt', 'yoghurt'],
  paneer: ['paneer', 'panir', 'cottage cheese'],
  eggs: ['egg', 'eggs', 'anda', 'ande', 'anday'],
  tomato: ['tomato', 'tamatar', 'tamata'],
  potato: ['potato', 'aloo', 'alu', 'batata', 'batate'],
  carrot: ['carrot', 'gajar', 'gajjar'],
  brinjal: ['brinjal', 'baingan', 'vangi', 'vange', 'eggplant'],
  banana: ['banana', 'kela', 'keli'],
  apple: ['apple', 'seb', 'safarchand'],
  orange: ['orange', 'santra', 'santre', 'narangi'],
  grapes: ['grapes', 'angur', 'draksha'],
  atta: ['atta', 'aata', 'gehu', 'flour', 'wheat flour', 'pith'],
  rice: ['rice', 'chawal', 'chaval', 'tandul', 'bhat'],
  oil: ['oil', 'tel', 'tail', 'sunflower oil'],
  sugar: ['sugar', 'chini', 'shakkar', 'sakhar'],
  biscuits: ['biscuit', 'biscuits', 'biskut', 'cookies', 'chai biscuit'],
  chips: ['chips', 'wafer', 'wafers', 'namkeen'],
  popcorn: ['popcorn', 'makai', 'bhutta'],
  chocolate: ['chocolate', 'choco', 'chocolet'],
};

/** What people call a whole category, in English letters. */
const CATEGORY_ALIASES: Readonly<Record<ItemCategory, readonly string[]>> = {
  dairy: ['dairy'],
  vegetables: ['vegetables', 'veggies', 'sabzi', 'sabji', 'bhaji', 'bhajipala'],
  fruits: ['fruits', 'fruit', 'phal', 'fal'],
  staples: ['staples', 'kirana', 'grocery', 'ration', 'anaj'],
  snacks: ['snacks', 'nashta', 'namkeen', 'munchies'],
};

/** The English-letter spellings people use for each shop. */
const SHOP_ALIASES: Readonly<Record<string, readonly string[]>> = {
  one: ['dairy', 'doodh', 'dudh', 'dahi', 'milk', 'paneer'],
  two: ['kirana', 'grocery', 'atta', 'dal', 'tel', 'masale', 'ration'],
  three: ['sabzi', 'bhaji', 'vegetables', 'fruits', 'phal', 'mandi'],
  four: ['bakery', 'bread', 'pav', 'biscuit', 'cake', 'bekri'],
};

const SHOP_IDS = ['one', 'two', 'three', 'four'] as const;

export interface SearchIndex {
  items: readonly SearchDoc[];
  shops: readonly SearchDoc[];
}

/**
 * What can be found, for the search screen: each item and each shop, searchable by its name in English,
 * Hindi and Marathi at once (whatever language the app is in), plus the English-letter spellings above.
 * An item can also be found by its category, so "vegetables" finds all of them.
 */
export function useSearchIndex(): SearchIndex {
  const items = useHomeItems();

  return useMemo(
    () => ({
      items: items.map((item) => ({
        id: item.id,
        terms: [
          ...LOCALES.map((locale) => lookupItemName(locale, item.id)),
          ...(ITEM_ALIASES[item.id] ?? []),
          ...LOCALES.map((locale) => messages[locale].home.categories[item.category]),
          ...CATEGORY_ALIASES[item.category],
        ],
      })),
      shops: SHOP_IDS.map((id) => ({
        id,
        terms: [
          ...LOCALES.flatMap((locale) => {
            const sample = messages[locale].home.shopsSheet.sample;
            return [sample[`${id}Name`], sample[`${id}Type`]];
          }),
          ...(SHOP_ALIASES[id] ?? []),
        ],
      })),
    }),
    [items],
  );
}

function lookupItemName(locale: (typeof LOCALES)[number], id: string): string {
  const names: Readonly<Record<string, string>> = messages[locale].home.items;
  return names[id] ?? '';
}
