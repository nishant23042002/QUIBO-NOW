import { useMemo } from 'react';
import { formatRupees, money, subtract, type Money } from '@quibo/contracts';
import { useLanguage } from '@/i18n/LanguageProvider';
import { WEIGHT_RULE, type GalleryImage } from '@/ui';
import {
  bestValueIndex,
  baseAmount,
  defaultPackIndex,
  unitPrice,
  type PackSize,
  type Unit,
  type UnitKind,
} from './packs';
import { BRAND_MARK, BRAND_OF, OTHER_SHOPS, TYPE_OF, type BrandId } from './brands';

/**
 * Whether any of these items shows a line under its pack (a low-stock warning, or the delivery window of an item that can come in
 * the next one), so a row of cards keeps room for it in every card and the row stays one height.
 */
export function anyCardNote(
  items: readonly { stock?: { kind: 'out' | 'low' }; quick?: true }[],
): boolean {
  return items.some((item) => item.stock?.kind === 'low' || item.quick === true);
}

type Translate = ReturnType<typeof useLanguage>['t'];

/** The categories that hold items. "All" is not one of them: it shows every category's row. */
export type ItemCategory = 'dairy' | 'vegetables' | 'fruits' | 'staples' | 'snacks';

/** The order the rows come in on Home when "All" is chosen; the loading skeleton draws the same rows. */
export const HOME_RAIL_ORDER: readonly ItemCategory[] = [
  'dairy',
  'vegetables',
  'fruits',
  'staples',
  'snacks',
];

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
    | 'chocolate'
    // The same kinds of product under other brands (ADR 0036): see `ALTERNATIVE_SAMPLES`.
    | 'milkGokul'
    | 'milkKatraj'
    | 'milkChitale'
    | 'curdAmul'
    | 'chocolateKitkat'
    | 'biscuitsBritannia';
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
  /** Sold loose, by the half kilogram: `price` and `mrp` are per kilogram and there is one pack, weighed when packed. */
  loose?: true;
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
    loose: true,
    category: 'vegetables',
    emoji: '\u{1F345}',
    amount: 1,
    unit: 'kg',
    price: 4200,
    mrp: 4600,
  },
  {
    id: 'potato',
    loose: true,
    category: 'vegetables',
    emoji: '\u{1F954}',
    amount: 1,
    unit: 'kg',
    price: 3400,
    mrp: 4000,
  },
  {
    id: 'carrot',
    loose: true,
    category: 'vegetables',
    emoji: '\u{1F955}',
    amount: 1,
    unit: 'kg',
    price: 5600,
  },
  {
    id: 'brinjal',
    loose: true,
    category: 'vegetables',
    emoji: '\u{1F346}',
    amount: 1,
    unit: 'kg',
    price: 5200,
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
  {
    id: 'orange',
    loose: true,
    category: 'fruits',
    emoji: '\u{1F34A}',
    amount: 1,
    unit: 'kg',
    price: 14000,
  },
  {
    id: 'grapes',
    loose: true,
    category: 'fruits',
    emoji: '\u{1F347}',
    amount: 1,
    unit: 'kg',
    price: 17000,
    mrp: 19000,
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

/**
 * The same kinds of product from other brands, which the product page offers as "Other brands of this" (ADR 0036). They sit after
 * `SAMPLES`, so each category's row shows the original items first. Two of them share a name ("Toned milk"); the brand, shown
 * with every item name (`fullName`), tells them apart.
 */
const ALTERNATIVE_SAMPLES: readonly Sample[] = [
  {
    id: 'milkGokul',
    quick: true,
    category: 'dairy',
    emoji: '\u{1F95B}',
    amount: 500,
    unit: 'ml',
    price: 2700,
    mrp: 2800,
  },
  {
    id: 'milkKatraj',
    category: 'dairy',
    emoji: '\u{1F95B}',
    amount: 500,
    unit: 'ml',
    price: 2800,
    mrp: 2900,
  },
  {
    id: 'milkChitale',
    category: 'dairy',
    emoji: '\u{1F95B}',
    amount: 500,
    unit: 'ml',
    price: 3100,
  },
  {
    id: 'curdAmul',
    quick: true,
    category: 'dairy',
    emoji: '\u{1F963}',
    amount: 400,
    unit: 'g',
    price: 3600,
    mrp: 3800,
  },
  {
    id: 'chocolateKitkat',
    category: 'snacks',
    emoji: '\u{1F36B}',
    amount: 1,
    unit: 'pack',
    price: 2000,
    mrp: 2200,
  },
  {
    id: 'biscuitsBritannia',
    category: 'snacks',
    emoji: '\u{1F36A}',
    amount: 1,
    unit: 'pack',
    price: 1200,
  },
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
  milkGokul: [{ amount: 1, unit: 'l', price: 5400, mrp: 5600, quick: true }],
  milkKatraj: [{ amount: 1, unit: 'l', price: 5700, mrp: 5900 }],
  curd: [{ amount: 1, unit: 'kg', price: 8200, mrp: 9000, quick: true }],
  paneer: [{ amount: 500, unit: 'g', price: 21000, mrp: 24000 }],
  eggs: [{ amount: 12, unit: 'pcs', price: 9200, mrp: 10400 }],
  atta: [{ amount: 5, unit: 'kg', price: 24500, mrp: 27000 }],
  rice: [{ amount: 5, unit: 'kg', price: 32000, mrp: 34500 }],
  oil: [{ amount: 500, unit: 'ml', price: 7200, mrp: 7800 }],
  sugar: [{ amount: 5, unit: 'kg', price: 21800, mrp: 23000 }],
};

/** The price of one litre, one kilogram or one piece, so items of different pack sizes can be compared. */
export interface HomeUnit {
  kind: UnitKind;
  paise: number;
  /** For example "₹58/L". */
  label: string;
}

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
  /** Can come in the next delivery: its card says when, in the words the cart uses for the order's delivery. */
  quick?: true;
  stock?: { kind: 'out' | 'low'; label: string };
  /** The price per litre, kilogram or piece, for example "₹58/L". Only on products with more than one pack. */
  unitPriceLabel?: string;
  /** The same price per unit as a figure, on every pack that has a size to compare by. */
  unit?: HomeUnit;
  /** The lowest price per litre, kilogram or piece of the packs that can be compared. */
  bestValue: boolean;
  /** Can be bought. False when the pack is out of stock. */
  available: boolean;
  /** How many can be bought: the number in stock, when that is a figure worth limiting by. Absent when there is no limit. */
  maxQuantity?: number;
  /** Sold loose by weight: the price is per kilogram, the amount in the cart is in kilograms (halves), and it is weighed when packed. */
  loose?: true;
  /** The most one order may hold of this pack, when that is not the usual count (kilograms of a loose item). */
  mostPerOrder?: number;
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
  /**
   * The plain kind of product it is ("milk"), the same for every brand of it. Items with the same type and different brands are
   * each other's "other brands". Product facts (shelf life, nutrition, the description) are held by type.
   */
  type: string;
  /** Who makes it, when it is branded. Absent for loose produce and a shop's own goods: screens show no brand line then. */
  brand?: { id: BrandId; name: string; mark: string };
  /** How many other shops also stock it. Absent when none do. */
  otherShops?: number;
  emoji: string;
  /** The product's own name, without its brand ("Toned milk"). */
  name: string;
  /**
   * The name as lists, the cart and the header show it: the brand, then the name ("Amul Toned milk"). Just the name when the item has
   * no brand.
   */
  fullName: string;
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
  quick?: true;
  stock?: { kind: 'out' | 'low'; label: string };
  /** The default pack's price per unit, as on `HomePack`. */
  unit?: HomeUnit;
  /** The default pack's stock limit, as on `HomePack`. */
  maxQuantity?: number;
  /** Sold loose by weight, as on `HomePack`. */
  loose?: true;
}

function buildHomeItems(t: Translate, samples: readonly Sample[]): readonly HomeItem[] {
  const label = (size: PackSize) => t(`home.units.${size.unit}`, { n: size.amount });

  return samples.map((sample) => {
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
      const perUnit = unitPrice(pack.price, pack);
      return {
        id:
          sample.loose === true ? `${sample.id}:loose` : `${sample.id}:${pack.amount}${pack.unit}`,
        label: sample.loose === true ? t('weights.perKg') : label(pack),
        price,
        ...(mrp !== undefined ? { mrp } : {}),
        ...(saving !== undefined
          ? { ribbon: { amount: formatRupees(saving), offLabel: t('home.rails.off') } }
          : {}),
        ...(pack.quick === true ? { quick: true as const } : {}),
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
        ...(perUnit !== undefined
          ? {
              unit: {
                kind: perUnit.kind,
                paise: perUnit.paise,
                label: t(`home.unitPrice.${perUnit.kind}`, {
                  amount: formatRupees(money(perUnit.paise)),
                }),
              },
            }
          : {}),
        bestValue: best === index,
        available: pack.stock !== 0,
        ...(pack.stock !== undefined && pack.stock > 0 ? { maxQuantity: pack.stock } : {}),
        ...(sample.loose === true ? { loose: true as const, mostPerOrder: WEIGHT_RULE.max } : {}),
      };
    });

    const first = packs[defaultPackIndex(packs)] ?? packs[0];
    // Every sample has at least its own pack, so this never happens; it keeps the types honest.
    if (first === undefined) throw new Error(`Item ${sample.id} has no packs`);
    const brandId = BRAND_OF[sample.id];
    const brandName = brandId === undefined ? undefined : t(`brands.${brandId}`);
    const name = t(`home.items.${sample.id}`);
    return {
      id: sample.id,
      shop,
      shopName: t(`home.shopsSheet.sample.${shop}Name`),
      category: sample.category,
      type: TYPE_OF[sample.id] ?? sample.id,
      ...(brandId !== undefined && brandName !== undefined
        ? { brand: { id: brandId, name: brandName, mark: BRAND_MARK[brandId] } }
        : {}),
      ...((OTHER_SHOPS[sample.id] ?? 0) > 0 ? { otherShops: OTHER_SHOPS[sample.id] ?? 0 } : {}),
      emoji: sample.emoji,
      name,
      fullName: brandName === undefined ? name : `${brandName} ${name}`,
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
      ...(first.quick === true ? { quick: true as const } : {}),
      ...(first.stock !== undefined ? { stock: first.stock } : {}),
      ...(first.unit !== undefined ? { unit: first.unit } : {}),
      ...(first.maxQuantity !== undefined ? { maxQuantity: first.maxQuantity } : {}),
      ...(first.loose === true ? { loose: true as const } : {}),
    };
  });
}

/**
 * The sample items, worded in the chosen language. Built once per language and shared, so a change to the cart does not rebuild the
 * whole catalogue and every list that holds it can tell that nothing changed.
 */
export function useHomeItems(): readonly HomeItem[] {
  const { t } = useLanguage();
  return useMemo(() => buildHomeItems(t, [...SAMPLES, ...ALTERNATIVE_SAMPLES]), [t]);
}
