import { formatRupees, money, subtract, type Money } from '@quibo/contracts';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { GalleryImage } from '@/ui';
import {
  bestValueIndex,
  baseAmount,
  defaultPackIndex,
  unitPrice,
  type PackSize,
  type Unit,
} from './packs';

/** The categories that hold items. "All" is not one of them: it shows every category's row. */
export type ItemCategory = 'dairy' | 'vegetables' | 'fruits' | 'staples' | 'snacks';

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
    amount: 1,
    unit: 'kg',
    price: 5200,
    mrp: 5600,
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

/**
 * The pictures of a product until there are real photos (Phase 1b): its emoji drawn three ways, front, inside the
 * pack and close up. Most products have all three; these have fewer, so the page shows one and two pictures too.
 */
const PHOTO_VIEWS = [
  { key: 'front', scale: 0.5, alt: false },
  { key: 'pack', scale: 0.22, alt: true },
  { key: 'close', scale: 0.95, alt: false },
] as const;
const PHOTO_COUNT: Readonly<Record<string, number>> = { banana: 1, chips: 2, biscuits: 2 };

/** One more way a product is sold: its own size, price and stock. The first pack is the sample's own fields above. */
interface SamplePack {
  amount: number;
  unit: Unit;
  price: number;
  mrp?: number;
  quick?: true;
  stock?: number;
}

/** The other packs of the products sold in more than one size, until the mock API supplies them (Phase 1b). */
const EXTRA_PACKS: Readonly<Record<string, readonly SamplePack[]>> = {
  milk: [{ amount: 1, unit: 'l', price: 5600, mrp: 5800, quick: true }],
  curd: [{ amount: 1, unit: 'kg', price: 8200, mrp: 9000, quick: true }],
  paneer: [{ amount: 500, unit: 'g', price: 21000, mrp: 24000 }],
  eggs: [{ amount: 12, unit: 'pcs', price: 9200, mrp: 10400 }],
  tomato: [{ amount: 1, unit: 'kg', price: 4200, mrp: 4600, quick: true }],
  potato: [{ amount: 2, unit: 'kg', price: 6400, mrp: 7600 }],
  atta: [{ amount: 5, unit: 'kg', price: 24500, mrp: 27000 }],
  rice: [{ amount: 5, unit: 'kg', price: 32000, mrp: 34500 }],
  oil: [{ amount: 500, unit: 'ml', price: 7200, mrp: 7800 }],
  sugar: [{ amount: 5, unit: 'kg', price: 21800, mrp: 23000 }],
};

/** One pack of a product, as the screens show it. */
export interface HomePack {
  /** The pack's own id, for example "milk:500ml". The cart counts by this. */
  id: string;
  /** For example "500 ml". */
  label: string;
  price: Money;
  mrp?: Money;
  /** The saving in rupees, for the ribbon: for example "₹1" and "OFF". Absent when there is none. */
  ribbon?: { amount: string; offLabel: string };
  /** For packs that can come in the next window: for example "Today 4–6 PM". */
  quickLabel?: string;
  stock?: { kind: 'out' | 'low'; label: string };
  /** The price per litre, kilogram or piece, for example "₹58/L". Only on products with more than one pack. */
  unitPriceLabel?: string;
  /** The lowest price per litre, kilogram or piece of the packs that can be compared. */
  bestValue: boolean;
  /** Can be bought. False when the pack is out of stock. */
  available: boolean;
  /** How many can be bought: the number in stock, when that is a figure worth limiting by. Absent when there is no limit. */
  maxQuantity?: number;
}

/**
 * A product as the screens show it. The fields from `pack` to `stock` are those of the pack a card shows (the
 * first one that can be bought); `packs` lists every size, smallest first.
 */
export interface HomeItem {
  id: string;
  /** The shop that sells it. One order can hold items from several shops. */
  shop: string;
  shopName: string;
  category: ItemCategory;
  emoji: string;
  name: string;
  diet: { kind: 'veg' | 'nonveg'; label: string };
  /** The product's pictures, the first being the one the big picture opens on. */
  images: readonly GalleryImage[];
  /** The id of the pack a card shows and adds. */
  defaultPackId: string;
  packs: readonly HomePack[];
  /** For a product sold in more than one size, for example "2 sizes". Shown on its card. */
  sizesLabel?: string;
  pack: string;
  price: Money;
  mrp?: Money;
  ribbon?: { amount: string; offLabel: string };
  quickLabel?: string;
  stock?: { kind: 'out' | 'low'; label: string };
  /** The default pack's stock limit, as on `HomePack`. */
  maxQuantity?: number;
}

export function useHomeItems(): readonly HomeItem[] {
  const { t } = useLanguage();

  const label = (size: PackSize) => t(`home.units.${size.unit}`, { n: size.amount });

  return SAMPLES.map((sample) => {
    const shop = SHOP_OF[sample.category];
    const raw: readonly SamplePack[] = [
      {
        amount: sample.amount,
        unit: sample.unit,
        price: sample.price,
        ...(sample.mrp !== undefined ? { mrp: sample.mrp } : {}),
        ...(sample.quick === true ? { quick: true as const } : {}),
        ...(sample.stock !== undefined ? { stock: sample.stock } : {}),
      },
      ...(EXTRA_PACKS[sample.id] ?? []),
    ].sort((a, b) => baseAmount(a) - baseAmount(b));

    const best = bestValueIndex(
      raw.map((pack) => ({ price: pack.price, size: pack, available: pack.stock !== 0 })),
    );

    const packs: HomePack[] = raw.map((pack, index) => {
      const price = money(pack.price);
      const mrp = pack.mrp === undefined ? undefined : money(pack.mrp);
      const saving = mrp !== undefined && mrp > price ? subtract(mrp, price) : undefined;
      const unit = raw.length > 1 ? unitPrice(pack.price, pack) : undefined;
      return {
        id: `${sample.id}:${pack.amount}${pack.unit}`,
        label: label(pack),
        price,
        ...(mrp !== undefined ? { mrp } : {}),
        ...(saving !== undefined
          ? { ribbon: { amount: formatRupees(saving), offLabel: t('home.rails.off') } }
          : {}),
        ...(pack.quick === true
          ? { quickLabel: t('home.rails.today', { window: t('home.header.sampleWindow') }) }
          : {}),
        ...(pack.stock === 0
          ? { stock: { kind: 'out' as const, label: t('home.rails.outOfStock') } }
          : pack.stock !== undefined
            ? {
                stock: {
                  kind: 'low' as const,
                  label: t('home.rails.onlyLeft', { count: pack.stock }),
                },
              }
            : {}),
        ...(unit !== undefined
          ? {
              unitPriceLabel: t(`home.unitPrice.${unit.kind}`, {
                amount: formatRupees(money(unit.paise)),
              }),
            }
          : {}),
        bestValue: best === index,
        available: pack.stock !== 0,
        ...(pack.stock !== undefined && pack.stock > 0 ? { maxQuantity: pack.stock } : {}),
      };
    });

    const first = packs[defaultPackIndex(packs)] ?? packs[0];
    // Every sample has at least its own pack, so this never happens; it keeps the types honest.
    if (first === undefined) throw new Error(`Item ${sample.id} has no packs`);
    return {
      id: sample.id,
      shop,
      shopName: t(`home.shopsSheet.sample.${shop}Name`),
      category: sample.category,
      emoji: sample.emoji,
      name: t(`home.items.${sample.id}`),
      diet: {
        kind: sample.nonVeg === true ? 'nonveg' : 'veg',
        label: t(sample.nonVeg === true ? 'home.rails.nonVeg' : 'home.rails.veg'),
      },
      images: PHOTO_VIEWS.slice(0, PHOTO_COUNT[sample.id] ?? PHOTO_VIEWS.length).map((view) => ({
        key: view.key,
        label: t(`product.photos.${view.key}`),
        emoji: sample.emoji,
        scale: view.scale,
        alt: view.alt,
      })),
      defaultPackId: first.id,
      packs,
      ...(packs.length > 1 ? { sizesLabel: t('home.rails.sizes', { count: packs.length }) } : {}),
      pack: first.label,
      price: first.price,
      ...(first.mrp !== undefined ? { mrp: first.mrp } : {}),
      ...(first.ribbon !== undefined ? { ribbon: first.ribbon } : {}),
      ...(first.quickLabel !== undefined ? { quickLabel: first.quickLabel } : {}),
      ...(first.stock !== undefined ? { stock: first.stock } : {}),
      ...(first.maxQuantity !== undefined ? { maxQuantity: first.maxQuantity } : {}),
    };
  });
}
