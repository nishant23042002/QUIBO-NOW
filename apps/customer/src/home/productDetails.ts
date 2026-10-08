import { messages } from '@quibo/i18n';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { FactRow } from '@/ui';
import type { HomeItem } from './items';

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
  /** The longer information: description, ingredients and the label disclaimer. */
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
      row('product.rows.packedBy', item.shopName),
    ],
    information: [
      ...(entry !== undefined
        ? [
            row('product.rows.description', entry.about),
            row('product.rows.ingredients', entry.ingredients),
          ]
        : []),
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
