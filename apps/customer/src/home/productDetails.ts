import { messages } from '@quibo/i18n';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { FactRow } from '@/ui';
import { addDays, addMonths, formatDay } from './dates';
import type { HomeItem, ItemCategory } from './items';

type Entry = { about: string; ingredients: string; goodFor: string };

/** How long each product keeps, until the catalogue supplies it (Phase 1b). */
const SHELF: Readonly<Record<string, { n: number; unit: 'days' | 'months' }>> = {
  milk: { n: 2, unit: 'days' },
  curd: { n: 4, unit: 'days' },
  paneer: { n: 5, unit: 'days' },
  eggs: { n: 21, unit: 'days' },
  tomato: { n: 5, unit: 'days' },
  potato: { n: 20, unit: 'days' },
  carrot: { n: 7, unit: 'days' },
  brinjal: { n: 5, unit: 'days' },
  banana: { n: 4, unit: 'days' },
  apple: { n: 10, unit: 'days' },
  orange: { n: 8, unit: 'days' },
  grapes: { n: 5, unit: 'days' },
  atta: { n: 3, unit: 'months' },
  rice: { n: 12, unit: 'months' },
  oil: { n: 9, unit: 'months' },
  sugar: { n: 12, unit: 'months' },
  biscuits: { n: 6, unit: 'months' },
  chips: { n: 3, unit: 'months' },
  popcorn: { n: 4, unit: 'months' },
  chocolate: { n: 8, unit: 'months' },
};

/** Where each product comes from, until the catalogue supplies it (Phase 1b). */
const ORIGIN: Readonly<Record<string, 'india' | 'maharashtra' | 'local'>> = {
  milk: 'local',
  curd: 'local',
  paneer: 'local',
  eggs: 'local',
  tomato: 'local',
  potato: 'local',
  carrot: 'local',
  brinjal: 'local',
  banana: 'maharashtra',
  orange: 'maharashtra',
  grapes: 'maharashtra',
  apple: 'india',
};

/** How many days before today each product was packed, until the catalogue supplies it (Phase 1b). Fresh things are packed today. */
const PACKED_DAYS_AGO: Readonly<Record<string, number>> = {
  paneer: 1,
  eggs: 3,
  apple: 2,
  atta: 14,
  rice: 30,
  oil: 45,
  sugar: 30,
  biscuits: 40,
  chips: 25,
  popcorn: 30,
  chocolate: 60,
};

/**
 * Who packs each kind of product and where, until the catalogue supplies it (Phase 1b). These are made-up names,
 * marked as samples, so nothing in the mock data can be mistaken for a real business or address. Addresses stay in
 * Latin letters, as on a pack.
 */
const PACKERS: Readonly<Record<ItemCategory, { name: string; address: string }>> = {
  dairy: { name: 'Roha Taluka Dairy (sample)', address: 'MIDC Area, Roha, Raigad 402109' },
  vegetables: { name: 'Patil Farm Produce (sample)', address: 'Dhatav Road, Roha, Raigad 402116' },
  fruits: { name: 'Patil Farm Produce (sample)', address: 'Dhatav Road, Roha, Raigad 402116' },
  staples: {
    name: 'Konkan Mills Pvt Ltd (sample)',
    address: 'Industrial Estate, Mahad, Raigad 402301',
  },
  snacks: { name: 'Konkan Foods Pvt Ltd (sample)', address: 'MIDC, Mahad, Raigad 402301' },
};

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

export interface SellerInfo {
  name: string;
  address: string;
  licence: string;
  care: string;
}

export interface ProductDetails {
  /** The facts shown at first: what it is, whether it is vegetarian, what it is good for and how long it keeps. */
  highlights: readonly FactRow[];
  /** The facts behind "View more": how to store it, where it comes from and who packed it. */
  moreHighlights: readonly FactRow[];
  /** The longer information: description, ingredients, when it was packed and by whom, and the label disclaimer. */
  information: readonly FactRow[];
  /** Who sells it, with the details a shopper expects to find on a pack. */
  seller: readonly FactRow[];
  /** The few facts the picture's insight card reads out. */
  glance: {
    /** Where it comes from, for example "Roha, Maharashtra". */
    place: string;
    /** How long it keeps, for example "2 days", and the same in days. */
    shelfLabel?: string;
    shelfDays?: number;
    goodFor?: string;
  };
}

/**
 * The detail a shopper reads before buying, as on the back of a pack: what it is, what is in it, how long it keeps,
 * where it comes from and who sells it. All of it is sample text until the catalogue and the shops supply it
 * (Phase 1b and 2). The shop's licence number and customer-care address are marked as samples on purpose, so
 * nothing in the mock data can be mistaken for a real licence.
 */
export function useProductDetails(
  item: HomeItem,
  seller: { id: string; name: string; licence: string; care: string },
): ProductDetails {
  const { locale, t } = useLanguage();
  const entries: Readonly<Record<string, Entry | undefined>> = messages[locale].product.details;
  const addresses: Readonly<Record<string, string | undefined>> = messages[locale].product.sellers;
  const entry = entries[item.id];
  const shelf = SHELF[item.id];

  const row = (key: Parameters<typeof t>[0], value: string): FactRow => ({ label: t(key), value });

  const origin = t(`product.origin.${ORIGIN[item.id] ?? 'india'}`);
  const monthNames = MONTH_KEYS.map((key) => messages[locale].product.months[key]);
  const today = new Date();
  const packedOn = addDays(today, -(PACKED_DAYS_AGO[item.id] ?? 0));
  const bestBefore =
    shelf === undefined
      ? undefined
      : shelf.unit === 'days'
        ? addDays(packedOn, shelf.n)
        : addMonths(packedOn, shelf.n);
  const packer = PACKERS[item.category];

  return {
    highlights: [
      row('product.rows.type', t(`home.categories.${item.category}`)),
      row('product.rows.diet', item.diet.label),
      ...(entry !== undefined ? [row('product.rows.goodFor', entry.goodFor)] : []),
      ...(shelf !== undefined
        ? [row('product.rows.shelfLife', t(`product.shelf.${shelf.unit}`, { n: shelf.n }))]
        : []),
    ],
    moreHighlights: [
      row('product.rows.storage', t(`product.storage.${item.category}`)),
      row('product.rows.origin', origin),
    ],
    information: [
      ...(entry !== undefined
        ? [
            row('product.rows.description', entry.about),
            row('product.rows.ingredients', entry.ingredients),
          ]
        : []),
      row('product.rows.packedOn', formatDay(packedOn, monthNames)),
      ...(bestBefore !== undefined
        ? [row('product.rows.bestBefore', formatDay(bestBefore, monthNames))]
        : []),
      row('product.rows.packedBy', packer.name),
      row('product.rows.packerAddress', packer.address),
      row('product.rows.disclaimer', t('product.disclaimer')),
    ],
    seller: [
      row('product.rows.seller', seller.name),
      row('product.rows.address', addresses[seller.id] ?? ''),
      row('product.rows.licence', seller.licence),
      row('product.rows.care', seller.care),
    ],
    glance: {
      place: origin,
      ...(shelf !== undefined
        ? {
            shelfLabel: t(`product.shelf.${shelf.unit}`, { n: shelf.n }),
            shelfDays: shelf.unit === 'days' ? shelf.n : shelf.n * 30,
          }
        : {}),
      ...(entry !== undefined ? { goodFor: entry.goodFor } : {}),
    },
  };
}
