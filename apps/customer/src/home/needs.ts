import type { MessageKey } from '@quibo/i18n';
import { CATEGORIES } from './catalogueTree';
import type { TileTint } from './categoryGroups';

/**
 * The needs Home offers (ADR 0044). A need cuts across categories ("Tea time" is milk, sugar, biscuits and chips): a list of product
 * kinds, not a category. It is data: a town lists the needs it offers, so adding one is a change to this list (a record per town
 * once the API exists) and not a change to the app. Sample data until the catalogue comes from the API (Phase 2).
 */

export type NeedId = 'breakfast' | 'teaTime' | 'partySnacks' | 'cookingBasics';

export interface Need {
  id: NeedId;
  label: MessageKey;
  emoji: string;
  tint: TileTint;
  /** The product kinds (an item's `type`) it gathers, in the order its page lists them. */
  kinds: readonly string[];
}

/** Made only of kinds the catalogue holds today, so no need page is empty. */
export const NEEDS: readonly Need[] = [
  {
    id: 'breakfast',
    label: 'departments.needs.breakfast',
    emoji: '\u{1F373}',
    tint: 'dairy',
    kinds: ['milk', 'eggs', 'atta', 'sugar', 'oil'],
  },
  {
    id: 'teaTime',
    label: 'departments.needs.teaTime',
    emoji: '\u{2615}',
    tint: 'snacks',
    kinds: ['milk', 'sugar', 'biscuits', 'chips'],
  },
  {
    id: 'partySnacks',
    label: 'departments.needs.partySnacks',
    emoji: '\u{1F389}',
    tint: 'snacks',
    kinds: ['chips', 'popcorn', 'chocolate', 'biscuits'],
  },
  {
    id: 'cookingBasics',
    label: 'departments.needs.cookingBasics',
    emoji: '\u{1F958}',
    tint: 'staples',
    kinds: ['atta', 'rice', 'oil', 'sugar', 'tomato', 'potato'],
  },
];

export function need(id: string | undefined): Need | undefined {
  return NEEDS.find((candidate) => candidate.id === id);
}

/** The items of a need, in the order of its kinds. */
export function needItems<T extends { type: string }>(items: readonly T[], target: Need): T[] {
  return target.kinds.flatMap((kind) => items.filter((item) => item.type === kind));
}

/** The kinds of a need that have at least one item, so its page never offers an empty tab. */
export function needKinds<T extends { type: string }>(items: readonly T[], target: Need): string[] {
  return target.kinds.filter((kind) => items.some((item) => item.type === kind));
}

/** The needs worth showing: those with at least one item. */
export function liveNeeds<T extends { type: string }>(
  items: readonly T[],
  needs: readonly Need[] = NEEDS,
): Need[] {
  return needs.filter((entry) => needKinds(items, entry).length > 0);
}

/** One shelf of a need's page: a sub-category of the catalogue, with the items of the need's kinds that sit in it. */
export interface NeedSection<T> {
  /** The sub-category's id. */
  id: string;
  label: MessageKey;
  emoji: string;
  items: T[];
}

interface SectionDraft {
  id: string;
  label: MessageKey;
  emoji: string;
  kinds: string[];
}

/** The sub-categories a need's kinds sit in, in the order the kinds list them, each with the kinds of the need it holds. */
function needDrafts(target: Need): SectionDraft[] {
  const drafts: SectionDraft[] = [];
  for (const kind of target.kinds) {
    const subs = CATEGORIES.flatMap((entry) => entry.subs);
    const sub = subs.find((candidate) => candidate.types.includes(kind));
    if (sub === undefined) continue;
    const existing = drafts.find((draft) => draft.id === sub.id);
    if (existing === undefined) {
      drafts.push({ id: sub.id, label: sub.label, emoji: sub.emoji, kinds: [kind] });
    } else {
      existing.kinds.push(kind);
    }
  }
  return drafts;
}

/**
 * The shelves of a need's page: its kinds grouped by the sub-category they sit in ("Fresh Vegetables" holds tomato and potato), in
 * the order the need lists them, each with its items. A shelf with nothing in stock is left out.
 */
export function needSections<T extends { type: string }>(
  items: readonly T[],
  target: Need,
): NeedSection<T>[] {
  return needDrafts(target)
    .map((draft) => ({
      id: draft.id,
      label: draft.label,
      emoji: draft.emoji,
      items: draft.kinds.flatMap((kind) => items.filter((item) => item.type === kind)),
    }))
    .filter((section) => section.items.length > 0);
}

/** The names (message keys) of the first few shelves of a need, for the line on its card on Home, whatever is in stock. */
export function needBlurb(target: Need, count = 3): MessageKey[] {
  return needDrafts(target)
    .slice(0, count)
    .map((draft) => draft.label);
}
