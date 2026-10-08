import { formatRupees, money, subtract, type Money } from '@quibo/contracts';
import { useLanguage } from '@/i18n/LanguageProvider';

/** The categories that hold items. "All" is not one of them: it shows every category's row. */
export type ItemCategory = 'dairy' | 'vegetables' | 'fruits' | 'staples' | 'snacks';

type Unit = 'ml' | 'l' | 'g' | 'kg' | 'pcs' | 'dozen' | 'pack';

interface Sample {
  id:
    | 'milk'
    | 'curd'
    | 'paneer'
    | 'eggs'
    | 'tomato'
    | 'potato'
    | 'carrot'
    | 'brinjal'
    | 'banana'
    | 'apple'
    | 'orange'
    | 'grapes'
    | 'atta'
    | 'rice'
    | 'oil'
    | 'sugar'
    | 'biscuits'
    | 'chips'
    | 'popcorn'
    | 'chocolate';
  category: ItemCategory;
  /** A stand-in for the photo, from emoji old enough for a low-end Android phone to draw. */
  emoji: string;
  amount: number;
  unit: Unit;
  /** In paise. */
  price: number;
  mrp?: number;
  /** Can come in the next delivery window. Only some items can. */
  quick?: true;
  /** Not vegetarian. Everything else is. */
  nonVeg?: true;
  /** Units left, when it is a count worth showing. 0 means out of stock. */
  stock?: number;
}

/**
 * Sample items until the mock API supplies them (Phase 1b). Prices are integer paise, as everywhere.
 * The names are in the message files; the pack sizes are built from a number and a unit word.
 */
const SAMPLES: readonly Sample[] = [
  {
    id: 'milk',
    quick: true,
    category: 'dairy',
    emoji: '\u{1F95B}',
    amount: 500,
    unit: 'ml',
    price: 2900,
    mrp: 3000,
  },
  {
    id: 'curd',
    quick: true,
    category: 'dairy',
    emoji: '\u{1F963}',
    amount: 400,
    unit: 'g',
    price: 3500,
  },
  {
    id: 'paneer',
    stock: 0,
    category: 'dairy',
    emoji: '\u{1F9C0}',
    amount: 200,
    unit: 'g',
    price: 9000,
    mrp: 10000,
  },
  {
    id: 'eggs',
    nonVeg: true,
    stock: 3,
    quick: true,
    category: 'dairy',
    emoji: '\u{1F95A}',
    amount: 6,
    unit: 'pcs',
    price: 4800,
    mrp: 5400,
  },
  {
    id: 'tomato',
    quick: true,
    category: 'vegetables',
    emoji: '\u{1F345}',
    amount: 500,
    unit: 'g',
    price: 2200,
  },
  {
    id: 'potato',
    category: 'vegetables',
    emoji: '\u{1F954}',
    amount: 1,
    unit: 'kg',
    price: 3400,
    mrp: 4000,
  },
  { id: 'carrot', category: 'vegetables', emoji: '\u{1F955}', amount: 500, unit: 'g', price: 3000 },
  {
    id: 'brinjal',
    category: 'vegetables',
    emoji: '\u{1F346}',
    amount: 500,
    unit: 'g',
    price: 2800,
  },
  {
    id: 'banana',
    quick: true,
    category: 'fruits',
    emoji: '\u{1F34C}',
    amount: 1,
    unit: 'dozen',
    price: 6000,
  },
  {
    id: 'apple',
    stock: 2,
    category: 'fruits',
    emoji: '\u{1F34E}',
    amount: 4,
    unit: 'pcs',
    price: 12000,
    mrp: 14000,
  },
  { id: 'orange', category: 'fruits', emoji: '\u{1F34A}', amount: 500, unit: 'g', price: 7000 },
  {
    id: 'grapes',
    category: 'fruits',
    emoji: '\u{1F347}',
    amount: 500,
    unit: 'g',
    price: 8500,
    mrp: 9500,
  },
  {
    id: 'atta',
    category: 'staples',
    emoji: '\u{1F33E}',
    amount: 5,
    unit: 'kg',
    price: 24500,
    mrp: 27000,
  },
  { id: 'rice', category: 'staples', emoji: '\u{1F35A}', amount: 1, unit: 'kg', price: 6800 },
  {
    id: 'oil',
    category: 'staples',
    emoji: '\u{1F33B}',
    amount: 1,
    unit: 'l',
    price: 13500,
    mrp: 14800,
  },
  { id: 'sugar', category: 'staples', emoji: '\u{1F36C}', amount: 1, unit: 'kg', price: 4600 },
  {
    id: 'biscuits',
    quick: true,
    category: 'snacks',
    emoji: '\u{1F36A}',
    amount: 1,
    unit: 'pack',
    price: 1000,
  },
  { id: 'chips', category: 'snacks', emoji: '\u{1F35F}', amount: 1, unit: 'pack', price: 2000 },
  {
    id: 'popcorn',
    category: 'snacks',
    emoji: '\u{1F37F}',
    amount: 1,
    unit: 'pack',
    price: 3000,
    mrp: 3500,
  },
  { id: 'chocolate', category: 'snacks', emoji: '\u{1F36B}', amount: 1, unit: 'pack', price: 1000 },
];

/** Which of the sample shops sells each category (Sharma Dairy, Joshi Kirana, Patil Vegetables). */
const SHOP_OF: Record<ItemCategory, 'one' | 'two' | 'three'> = {
  dairy: 'one',
  vegetables: 'three',
  fruits: 'three',
  staples: 'two',
  snacks: 'two',
};

export interface HomeItem {
  id: string;
  /** The shop that sells it. An order is from one shop, so a cart holds one shop's items. */
  shop: string;
  shopName: string;
  category: ItemCategory;
  emoji: string;
  name: string;
  pack: string;
  price: Money;
  mrp?: Money;
  /** The saving in rupees, for the ribbon: for example "₹1" and "OFF". Absent when there is none. */
  ribbon?: { amount: string; offLabel: string };
  /** For items that can come in the next window: for example "Today 4–6 PM". */
  quickLabel?: string;
  diet: { kind: 'veg' | 'nonveg'; label: string };
  stock?: { kind: 'out' | 'low'; label: string };
}

export function useHomeItems(): readonly HomeItem[] {
  const { t } = useLanguage();

  return SAMPLES.map((sample) => {
    const price = money(sample.price);
    const mrp = sample.mrp === undefined ? undefined : money(sample.mrp);
    const saving = mrp !== undefined && mrp > price ? subtract(mrp, price) : undefined;
    const shop = SHOP_OF[sample.category];
    return {
      id: sample.id,
      shop,
      shopName: t(`home.shopsSheet.sample.${shop}Name`),
      category: sample.category,
      emoji: sample.emoji,
      name: t(`home.items.${sample.id}`),
      pack: t(`home.units.${sample.unit}`, { n: sample.amount }),
      price,
      ...(mrp !== undefined ? { mrp } : {}),
      ...(saving !== undefined
        ? { ribbon: { amount: formatRupees(saving), offLabel: t('home.rails.off') } }
        : {}),
      diet: {
        kind: sample.nonVeg === true ? 'nonveg' : 'veg',
        label: t(sample.nonVeg === true ? 'home.rails.nonVeg' : 'home.rails.veg'),
      },
      ...(sample.stock === 0
        ? { stock: { kind: 'out' as const, label: t('home.rails.outOfStock') } }
        : sample.stock !== undefined
          ? {
              stock: {
                kind: 'low' as const,
                label: t('home.rails.onlyLeft', { count: sample.stock }),
              },
            }
          : {}),
      ...(sample.quick === true
        ? {
            quickLabel: t('home.rails.today', { window: t('home.header.sampleWindow') }),
          }
        : {}),
    };
  });
}
