import { add, money, multiplyByQuantity, subtract, type Money } from '@quibo/contracts';

/** One pack of one product in the cart, with how many. */
export interface CartEntry {
  /** The pack's own id: the cart is counted by pack, so two sizes of one product are two lines. */
  packId: string;
  productId: string;
  shopId: string;
  shopName: string;
  price: Money;
  /** The printed price, when it is higher than `price`. */
  mrp?: Money;
  /** How many, or for a loose item how many kilograms: `price` is per piece, or per kilogram. */
  quantity: number;
  /** Sold by weight: however many kilograms, it counts as one item. */
  loose?: boolean;
}

export interface CartLineSum {
  entry: CartEntry;
  lineTotal: Money;
}

export interface BasketSum {
  shopId: string;
  shopName: string;
  count: number;
  total: Money;
  lines: CartLineSum[];
}

export interface CartSum {
  count: number;
  total: Money;
  /** What the cart saves against the printed prices. */
  saved: Money;
  /** One basket per shop, in the order the shops first appear in the entries. */
  baskets: BasketSum[];
}

/**
 * Adds a cart up. Money stays in integer paise throughout: each line is price times quantity, a basket is the sum of
 * its lines, and the cart is the sum of the baskets. Entries with nothing in them are left out.
 */
export function summariseCart(entries: readonly CartEntry[]): CartSum {
  let count = 0;
  let total: Money = money(0);
  let saved: Money = money(0);
  const baskets = new Map<string, BasketSum>();

  for (const entry of entries) {
    if (entry.quantity <= 0) continue;
    const lineTotal = multiplyByQuantity(entry.price, entry.quantity);
    const items = entry.loose === true ? 1 : entry.quantity;
    count += items;
    total = add(total, lineTotal);
    if (entry.mrp !== undefined && entry.mrp > entry.price) {
      saved = add(saved, multiplyByQuantity(subtract(entry.mrp, entry.price), entry.quantity));
    }
    const basket = baskets.get(entry.shopId) ?? {
      shopId: entry.shopId,
      shopName: entry.shopName,
      count: 0,
      total: money(0),
      lines: [],
    };
    basket.lines.push({ entry, lineTotal });
    basket.total = add(basket.total, lineTotal);
    basket.count += items;
    baskets.set(entry.shopId, basket);
  }

  return { count, total, saved, baskets: [...baskets.values()] };
}
