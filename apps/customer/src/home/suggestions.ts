/**
 * What goes with what, for the sample items, until the catalogue says so itself (Phase 2). Each item lists the things people
 * add after it, the likeliest first.
 */
const GOES_WITH: Readonly<Record<string, readonly string[]>> = {
  milk: ['biscuits', 'sugar', 'banana', 'eggs'],
  curd: ['rice', 'potato', 'banana'],
  paneer: ['tomato', 'oil', 'atta'],
  eggs: ['oil', 'potato', 'tomato', 'milk'],
  tomato: ['potato', 'oil', 'paneer', 'carrot'],
  potato: ['oil', 'tomato', 'atta', 'carrot'],
  carrot: ['tomato', 'potato', 'brinjal'],
  brinjal: ['tomato', 'oil', 'potato'],
  banana: ['milk', 'apple', 'curd'],
  apple: ['banana', 'orange', 'grapes'],
  orange: ['apple', 'grapes', 'banana'],
  grapes: ['apple', 'orange', 'banana'],
  atta: ['oil', 'sugar', 'paneer', 'potato'],
  rice: ['oil', 'curd', 'tomato'],
  oil: ['atta', 'rice', 'potato'],
  sugar: ['milk', 'atta', 'biscuits'],
  biscuits: ['milk', 'chips', 'chocolate'],
  chips: ['popcorn', 'biscuits', 'chocolate'],
  popcorn: ['chips', 'chocolate'],
  chocolate: ['biscuits', 'milk', 'popcorn'],
};

/** What the suggestions need to know about an item. */
export interface Suggestable {
  id: string;
  category: string;
  /** Out of stock: never suggested. */
  soldOut: boolean;
}

/**
 * The items to suggest under a cart, best first. An item scores for each thing in the cart it goes with (more for the likeliest
 * partners), and half a point for being in a category the cart already has, which never outweighs a likelier partner. Nothing already in the cart is suggested, nor
 * anything out of stock. An item that goes with nothing in the cart is only suggested to fill the row when too few do.
 */
export function suggestItems(
  inCart: readonly { id: string; category: string }[],
  catalogue: readonly Suggestable[],
  limit = 8,
): string[] {
  const cartIds = new Set(inCart.map((item) => item.id));
  const cartCategories = new Set(inCart.map((item) => item.category));
  const score = new Map<string, number>();
  for (const item of inCart) {
    (GOES_WITH[item.id] ?? []).forEach((partner, index) => {
      score.set(partner, (score.get(partner) ?? 0) + (index === 0 ? 3 : 2));
    });
  }

  const open = catalogue.filter((item) => !item.soldOut && !cartIds.has(item.id));
  const scored = open
    .map((item, order) => ({
      id: item.id,
      order,
      points: (score.get(item.id) ?? 0) + (cartCategories.has(item.category) ? 0.5 : 0),
      pairs: score.has(item.id),
    }))
    .sort((a, b) => b.points - a.points || a.order - b.order);

  const pairs = scored.filter((item) => item.pairs);
  const rest = scored.filter((item) => !item.pairs);
  return [...pairs, ...rest].slice(0, limit).map((item) => item.id);
}
