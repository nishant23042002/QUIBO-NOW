import type { MessageKey } from '@quibo/i18n';
import { CATEGORIES } from './catalogueTree';
import type { TileTint } from './categoryGroups';

/**
 * The moments Home offers (ADR 0044, and the moments plan): a moment cuts across categories ("Tea Break" is milk, sugar, biscuits,
 * rusk and namkeen), a list of product kinds and not a category. It is data: a town lists the moments it offers, so adding one is a
 * change to this list (a record per town once the API exists) and not a change to the app. The code still calls them needs. Sample
 * data until the catalogue comes from the API (Phase 2).
 */

export type NeedId = 'teaBreak' | 'breakfast' | 'cookToday' | 'movieNight';

export interface Need {
  id: NeedId;
  label: MessageKey;
  /** The one line under the name, on the moment's page. */
  line: MessageKey;
  /** The main picture of its card, and two smaller ones beside it, until each need has a picture of its own. */
  emoji: string;
  extras: readonly [string, string];
  tint: TileTint;
  /** The product kinds (an item's `type`) it gathers, in the order its page lists them. */
  kinds: readonly string[];
  /** A short hint under a kind's shelf, saying what it goes with. A hint, never a bundle: every brand can still be chosen alone. */
  goes: Readonly<Record<string, MessageKey>>;
  /** A kind the moment wants that the town does not stock yet, named for a quiet "coming soon" row with Notify me. */
  soon?: MessageKey;
}

/** Made only of kinds the catalogue holds today, so no moment page is empty. */
export const NEEDS: readonly Need[] = [
  {
    id: 'teaBreak',
    label: 'needs.names.teaBreak',
    line: 'needs.lines.teaBreak',
    emoji: '\u{2615}',
    extras: ['\u{1F36A}', '\u{1F95B}'],
    tint: 'snacks',
    kinds: ['milk', 'sugar', 'biscuits', 'rusk', 'namkeen'],
    goes: {
      milk: 'needs.goes.teaBreak.milk',
      biscuits: 'needs.goes.teaBreak.biscuits',
      rusk: 'needs.goes.teaBreak.rusk',
      namkeen: 'needs.goes.teaBreak.namkeen',
    },
  },
  {
    id: 'breakfast',
    label: 'needs.names.breakfast',
    line: 'needs.lines.breakfast',
    emoji: '\u{1F373}',
    extras: ['\u{1F95B}', '\u{1F35E}'],
    tint: 'dairy',
    kinds: ['bread', 'eggs', 'milk', 'pav', 'paneer', 'banana'],
    goes: {
      bread: 'needs.goes.breakfast.bread',
      eggs: 'needs.goes.breakfast.eggs',
      pav: 'needs.goes.breakfast.pav',
      paneer: 'needs.goes.breakfast.paneer',
    },
  },
  {
    id: 'cookToday',
    label: 'needs.names.cookToday',
    line: 'needs.lines.cookToday',
    emoji: '\u{1F958}',
    extras: ['\u{1F33E}', '\u{1F345}'],
    tint: 'staples',
    kinds: ['atta', 'rice', 'dal', 'oil', 'tomato', 'potato', 'brinjal', 'paneer', 'masala'],
    goes: {
      atta: 'needs.goes.cookToday.atta',
      dal: 'needs.goes.cookToday.dal',
      oil: 'needs.goes.cookToday.oil',
      tomato: 'needs.goes.cookToday.tomato',
      potato: 'needs.goes.cookToday.potato',
      paneer: 'needs.goes.cookToday.paneer',
      masala: 'needs.goes.cookToday.masala',
    },
  },
  {
    id: 'movieNight',
    label: 'needs.names.movieNight',
    line: 'needs.lines.movieNight',
    emoji: '\u{1F37F}',
    extras: ['\u{1F35F}', '\u{1F36B}'],
    tint: 'snacks',
    kinds: ['popcorn', 'chips', 'namkeen', 'chocolate', 'cake'],
    goes: {
      popcorn: 'needs.goes.movieNight.popcorn',
      chips: 'needs.goes.movieNight.chips',
      namkeen: 'needs.goes.movieNight.namkeen',
      chocolate: 'needs.goes.movieNight.chocolate',
      cake: 'needs.goes.movieNight.cake',
    },
    soon: 'needs.soon.drinks',
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
