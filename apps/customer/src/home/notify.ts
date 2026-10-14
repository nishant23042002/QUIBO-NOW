/**
 * "Notify me" on a category that is not in Roha yet (ADR 0055 step 5, decision 6). In Phase 1 the choice is kept on the phone and
 * sent to the API in Phase 2, so what it holds is only what that later send needs: which things the shopper asked to hear about,
 * and when they agreed, under which wording (the consent log the project rules ask for). No phone number or name is kept here.
 */

/** Where it is saved on the phone. */
export const NOTIFY_KEY = 'quibo.notify';

/**
 * The wording of the consent the shopper agreed to by tapping Notify me. Change it when the wording changes, so the log says which
 * one was agreed to.
 */
export const NOTIFY_CONSENT_VERSION = 'notify-v1';

export interface NotifyData {
  /** What they asked to hear about: a category's id, or `group:<id>` for a whole group that is coming. */
  ids: readonly string[];
  /** When they first asked, as an ISO time, and the wording they agreed to. Both are null until the first time. */
  consentAt: string | null;
  consentVersion: string | null;
}

export const EMPTY_NOTIFY: NotifyData = { ids: [], consentAt: null, consentVersion: null };

/** The id for a whole group on the "Coming soon to Roha" row. */
export const groupNotifyId = (groupId: string): string => `group:${groupId}`;

export function isNotified(data: NotifyData, id: string): boolean {
  return data.ids.includes(id);
}

/**
 * Turns Notify me on for `id`, or off when it was on. The first time anything is turned on, the time and the wording are recorded;
 * turning things off later does not erase that, because it says when the shopper first agreed.
 */
export function toggleNotify(data: NotifyData, id: string, now: Date): NotifyData {
  if (isNotified(data, id)) return { ...data, ids: data.ids.filter((entry) => entry !== id) };
  return {
    ids: [...data.ids, id],
    consentAt: data.consentAt ?? now.toISOString(),
    consentVersion: data.consentVersion ?? NOTIFY_CONSENT_VERSION,
  };
}

/** What was saved, read defensively: anything unexpected is treated as nothing saved. */
export function parseNotify(raw: string | null): NotifyData {
  if (raw === null) return EMPTY_NOTIFY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_NOTIFY;
    const record = parsed as Record<string, unknown>;
    const ids = Array.isArray(record.ids)
      ? record.ids.filter((entry): entry is string => typeof entry === 'string')
      : [];
    return {
      ids: [...new Set(ids)],
      consentAt: ids.length > 0 && typeof record.consentAt === 'string' ? record.consentAt : null,
      consentVersion:
        ids.length > 0 && typeof record.consentVersion === 'string' ? record.consentVersion : null,
    };
  } catch {
    return EMPTY_NOTIFY;
  }
}

export function serializeNotify(data: NotifyData): string {
  return JSON.stringify(data);
}

/**
 * What the screen holds once the saved choices have been read back, when the shopper has already tapped something in the meantime:
 * both are kept.
 */
export function mergeNotify(saved: NotifyData, current: NotifyData): NotifyData {
  const ids = [...new Set([...saved.ids, ...current.ids])];
  return {
    ids,
    consentAt: saved.consentAt ?? current.consentAt,
    consentVersion: saved.consentVersion ?? current.consentVersion,
  };
}
