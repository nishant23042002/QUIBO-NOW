import { messages } from '@quibo/i18n';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { FactRow } from '@/ui';
import { addDays, addMonths, formatDay } from './dates';
import { NUTRITION, formatNutrient, macroShares, perServing } from './nutrition';
import type { HomeItem, ItemCategory } from './items';

type Entry = { about: string; ingredients: string; goodFor: string; tip: string };

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

/**
 * The facts that tell one product of a kind from another, named the way shoppers see them named elsewhere (Fat Profile, Shelf Life,
 * Biological Source, Processing Type), until the catalogue supplies them (Phase 1b). Only kinds that have such facts are listed;
 * the others fall back to Product Type and Dietary Preference.
 */
type AttrLabel = 'fatProfile' | 'biologicalSource' | 'processingType' | 'sugarProfile';
type AttrValue =
  'toned' | 'fullCream' | 'cowMilk' | 'buffaloMilk' | 'hen' | 'pasteurized' | 'noAddedSugar';
const ATTRIBUTES: Readonly<Record<string, Partial<Record<AttrLabel, AttrValue>>>> = {
  milk: {
    fatProfile: 'toned',
    biologicalSource: 'cowMilk',
    processingType: 'pasteurized',
    sugarProfile: 'noAddedSugar',
  },
  curd: { fatProfile: 'toned', biologicalSource: 'cowMilk', processingType: 'pasteurized' },
  paneer: { fatProfile: 'fullCream', biologicalSource: 'cowMilk', processingType: 'pasteurized' },
  eggs: { biologicalSource: 'hen' },
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
  /**
   * The facts that tell it apart, most telling first. The strip on the page shows the first few as chips; the details sheet shows
   * them all.
   */
  highlights: readonly FactRow[];
  /** Key Information: brand, what it is made of or how, whether it is vegetarian, what it is good for. */
  keyInformation: readonly FactRow[];
  /** Nutritional Information: what a helping holds. Empty when there are no figures for this product. */
  nutrition: readonly FactRow[];
  /**
   * Info: the description, ingredients, how long it keeps and how to store it, where it comes from, when and by whom it was
   * packed, who sells it with the licence and customer care details, and the label disclaimer.
   */
  info: readonly FactRow[];
  /** How many days before today it was packed: 0 for fresh goods. The page says "Packed today" or "Packed yesterday" from it. */
  packedDaysAgo: number;
  /** The facts the picture's insight card reads out, in the order it shows them. */
  glance: {
    /** What to look at when it arrives, said for this kind of product. */
    check: string;
    /** What a normal helping holds (approximately), with the helping named: absent when there are no figures. */
    nutrition?: {
      serving: string;
      energy: { value: string; unit: string };
      macros: readonly { label: string; value: string; share: number }[];
    };
    /** A short, practical food tip for this product. */
    tip?: string;
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
  // Product facts are held by kind of product, so every brand of toned milk reads the same facts.
  const entry = entries[item.type];
  const shelf = SHELF[item.type];

  const row = (key: Parameters<typeof t>[0], value: string): FactRow => ({ label: t(key), value });

  const origin = t(`product.origin.${ORIGIN[item.type] ?? 'india'}`);
  const monthNames = MONTH_KEYS.map((key) => messages[locale].product.months[key]);
  const today = new Date();
  const packedDaysAgo = PACKED_DAYS_AGO[item.type] ?? 0;
  const packedOn = addDays(today, -packedDaysAgo);
  const bestBefore =
    shelf === undefined
      ? undefined
      : shelf.unit === 'days'
        ? addDays(packedOn, shelf.n)
        : addMonths(packedOn, shelf.n);
  const packer = PACKERS[item.category];
  const facts = NUTRITION[item.type];
  const nutrition = (() => {
    if (facts === undefined) return undefined;
    const helping = perServing(facts.per100, facts.serving.amount);
    const serving =
      facts.serving.name !== undefined
        ? t(`product.servings.${facts.serving.name}`)
        : t(`home.units.${facts.serving.unit}`, { n: facts.serving.amount });
    const grams = (value: number) => t('product.insight.grams', { n: formatNutrient(value) });
    const shares = macroShares(helping);
    return {
      serving,
      energy: { value: String(helping.kcal), unit: t('product.insight.kcalUnit') },
      macros: [
        {
          label: t('product.insight.statProtein'),
          value: grams(helping.protein),
          share: shares.protein,
        },
        { label: t('product.insight.statCarbs'), value: grams(helping.carbs), share: shares.carbs },
        { label: t('product.insight.statFat'), value: grams(helping.fat), share: shares.fat },
      ],
    };
  })();

  const attrs = ATTRIBUTES[item.type];
  const attrRow = (label: AttrLabel): FactRow[] => {
    const value = attrs?.[label];
    return value === undefined
      ? []
      : [{ label: t(`product.rows.${label}`), value: t(`product.attr.${value}`) }];
  };
  const shelfRow: FactRow[] =
    shelf === undefined
      ? []
      : [row('product.rows.shelfLife', t(`product.shelf.${shelf.unit}`, { n: shelf.n }))];
  const goodFor: FactRow[] =
    entry !== undefined ? [row('product.rows.goodFor', entry.goodFor)] : [];
  const diet = row('product.rows.diet', item.diet.label);
  const hasAttrs =
    attrs !== undefined &&
    (attrs.fatProfile !== undefined ||
      attrs.biologicalSource !== undefined ||
      attrs.processingType !== undefined);

  return {
    packedDaysAgo,
    // For a kind that has them: Fat Profile, Shelf Life, Biological Source, Processing Type, in that order.
    highlights: hasAttrs
      ? [
          ...attrRow('fatProfile'),
          ...shelfRow,
          ...attrRow('biologicalSource'),
          ...attrRow('processingType'),
        ]
      : [
          row('product.rows.type', t(`home.categories.${item.category}`)),
          ...shelfRow,
          diet,
          ...goodFor,
        ],
    keyInformation: [
      ...(item.brand !== undefined ? [row('product.rows.brand', item.brand.name)] : []),
      ...(hasAttrs
        ? [
            ...attrRow('fatProfile'),
            ...attrRow('processingType'),
            ...attrRow('biologicalSource'),
            ...attrRow('sugarProfile'),
          ]
        : [row('product.rows.type', t(`home.categories.${item.category}`))]),
      diet,
      ...goodFor,
    ],
    nutrition:
      nutrition === undefined
        ? []
        : [
            row('product.rows.servingSize', nutrition.serving),
            row('product.rows.energy', `${nutrition.energy.value} ${nutrition.energy.unit}`),
            ...nutrition.macros.map((macro) => ({ label: macro.label, value: macro.value })),
          ],
    info: [
      ...(entry !== undefined
        ? [
            row('product.rows.description', entry.about),
            row('product.rows.ingredients', entry.ingredients),
          ]
        : []),
      ...shelfRow,
      row('product.rows.storage', t(`product.storage.${item.category}`)),
      row('product.rows.origin', origin),
      row('product.rows.packedOn', formatDay(packedOn, monthNames)),
      ...(bestBefore !== undefined
        ? [row('product.rows.bestBefore', formatDay(bestBefore, monthNames))]
        : []),
      row('product.rows.packedBy', packer.name),
      row('product.rows.packerAddress', packer.address),
      row('product.rows.seller', seller.name),
      row('product.rows.address', addresses[seller.id] ?? ''),
      row('product.rows.licence', seller.licence),
      row('product.rows.care', seller.care),
      row('product.rows.disclaimer', t('product.disclaimer')),
    ],
    glance: {
      check: t(
        item.type === 'eggs'
          ? 'product.insight.checkEggs'
          : item.category === 'vegetables' || item.category === 'fruits'
            ? 'product.insight.checkFresh'
            : 'product.insight.checkPacked',
      ),
      ...(nutrition !== undefined ? { nutrition } : {}),
      ...(entry !== undefined ? { tip: entry.tip, goodFor: entry.goodFor } : {}),
    },
  };
}
