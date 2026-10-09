import type { CareClass } from './delivery';
import type { ItemCategory } from './items';

/** Things that need more care than the rest of their category: eggs break. */
const FRAGILE: readonly string[] = ['eggs'];

/**
 * How carefully an item has to be handled. Eggs are fragile; milk, curd and paneer have to stay cold; flour, rice,
 * oil and sugar are heavy; vegetables and fruit are fresh produce; the rest is packed the usual way. A sample rule
 * until the catalogue carries a care class on each product (Phase 2).
 */
export function careOf(id: string, category: ItemCategory): CareClass {
  if (FRAGILE.includes(id)) return 'fragile';
  switch (category) {
    case 'dairy':
      return 'chilled';
    case 'staples':
      return 'heavy';
    case 'vegetables':
    case 'fruits':
      return 'fresh';
    case 'snacks':
      return 'standard';
  }
}
