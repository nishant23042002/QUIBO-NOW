/** What can go wrong with an order. The first three are about the things in it, so they ask which ones. */
export const PROBLEM_KINDS = ['missing', 'wrong', 'damaged', 'payment', 'other'] as const;
export type ProblemKind = (typeof PROBLEM_KINDS)[number];

/** Whether a kind of problem is about particular things in the order. */
export function asksForItems(kind: ProblemKind): boolean {
  return kind === 'missing' || kind === 'wrong' || kind === 'damaged';
}

/** The longest note a shopper can add. */
export const NOTE_MAX = 200;

export function clampNote(text: string): string {
  return text.slice(0, NOTE_MAX);
}

/** What the shopper has filled in so far. */
export interface Draft {
  orderId: string | null;
  kind: ProblemKind | null;
  /** Pack ids of the things the problem is about. */
  itemIds: readonly string[];
  note: string;
}

export const EMPTY_DRAFT: Draft = { orderId: null, kind: null, itemIds: [], note: '' };

/** Whether the report can be sent: an order, a kind, and (for the kinds that are about things) at least one thing. */
export function canSend(draft: Draft): boolean {
  if (draft.orderId === null || draft.kind === null) return false;
  return !asksForItems(draft.kind) || draft.itemIds.length > 0;
}

/** Picks or puts back one thing. */
export function toggleItem(itemIds: readonly string[], packId: string): string[] {
  return itemIds.includes(packId) ? itemIds.filter((id) => id !== packId) : [...itemIds, packId];
}

/** A report that was sent. It is kept with the order it is about, and has no answer yet: that comes from a person. */
export interface Report {
  id: string;
  orderId: string;
  kind: ProblemKind;
  itemIds: string[];
  note: string;
  /** An ISO time. */
  at: string;
}

/** Makes the report from a draft that can be sent. The things only count for the kinds that are about things. */
export function buildReport(draft: Draft, id: string, now: Date): Report | null {
  if (!canSend(draft) || draft.orderId === null || draft.kind === null) return null;
  return {
    id,
    orderId: draft.orderId,
    kind: draft.kind,
    itemIds: asksForItems(draft.kind) ? [...draft.itemIds] : [],
    note: clampNote(draft.note.trim()),
    at: now.toISOString(),
  };
}

/** Bumped when the saved shape changes, so an old one is ignored rather than misread. */
const VERSION = 1;
/** The most reports kept on the phone: the newest. */
const KEEP = 50;

export function serialiseReports(reports: readonly Report[]): string {
  return JSON.stringify({ v: VERSION, reports: reports.slice(0, KEEP) });
}

/** Reads reports back, dropping anything that is not a well-formed one. */
export function parseReports(saved: string | null): Report[] {
  if (saved === null) return [];
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    if (parsed === null || typeof parsed !== 'object' || parsed.v !== VERSION) return [];
    const list = Array.isArray(parsed.reports) ? (parsed.reports as unknown[]) : [];
    return list.flatMap((item): Report[] => {
      if (item === null || typeof item !== 'object') return [];
      const entry = item as Record<string, unknown>;
      const kind = PROBLEM_KINDS.find((candidate) => candidate === entry.kind);
      const ids = entry.itemIds;
      if (
        typeof entry.id !== 'string' ||
        typeof entry.orderId !== 'string' ||
        kind === undefined ||
        !Array.isArray(ids) ||
        !ids.every((id) => typeof id === 'string') ||
        typeof entry.note !== 'string' ||
        typeof entry.at !== 'string' ||
        Number.isNaN(Date.parse(entry.at))
      ) {
        return [];
      }
      return [
        {
          id: entry.id,
          orderId: entry.orderId,
          kind,
          itemIds: ids,
          note: clampNote(entry.note),
          at: entry.at,
        },
      ];
    });
  } catch {
    return [];
  }
}
