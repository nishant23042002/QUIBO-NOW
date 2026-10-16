/**
 * What one press of ADD puts in the cart, priced. A loose item (tomato, potato) is priced by the kilogram but ADD puts in half a
 * kilogram (the smallest step the cart takes), so a card that showed the price per kilogram would show twice what the first press
 * costs. A card shows the price of what ADD adds and, apart from it, the price per kilogram. Money is integer paise.
 */

/** The price of `step` of the unit a price is quoted for (half a kilogram of a price per kilogram), in whole paise. */
export function entryShare(paise: number, step: number): number {
  return Math.round(paise * step);
}

/** The price a screen compares with a limit ("under ₹50"): what one press of ADD costs, when the item has such a price. */
export function shownPrice(item: { price: number; entryPrice?: number | undefined }): number {
  return item.entryPrice ?? item.price;
}
