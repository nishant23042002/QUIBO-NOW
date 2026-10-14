/**
 * "Can't find something?" on Home (ADR 0055, step 8, decision 6): the shopper writes down what they want and it is kept on the phone
 * with when they agreed to share it, ready to go to the town's shops in Phase 2. Only the words they typed and the time are kept.
 */

/** Where it is saved on the phone. */
export const REQUESTS_KEY = 'quibo.requests';

/** The wording of the consent the shopper agreed to by tapping "Ask shops". Change it when the wording changes. */
export const REQUESTS_CONSENT_VERSION = 'ask-shops-v1';

/** The longest a request may be, and how many are kept (the newest). */
export const REQUEST_MAX_LENGTH = 80;
export const REQUESTS_KEPT = 20;

export interface ShopRequest {
  /** What was asked for, as typed. */
  text: string;
  /** When, as an ISO time. */
  at: string;
}

export interface RequestsData {
  requests: readonly ShopRequest[];
  /** When they first agreed, and under which wording. Null until the first request. */
  consentAt: string | null;
  consentVersion: string | null;
}

export const EMPTY_REQUESTS: RequestsData = { requests: [], consentAt: null, consentVersion: null };

/** What may be sent: the words trimmed and made one line, at least two letters, at most `REQUEST_MAX_LENGTH`. Otherwise undefined. */
export function cleanRequest(raw: string): string | undefined {
  const text = raw.replace(/\s+/g, ' ').trim().slice(0, REQUEST_MAX_LENGTH).trim();
  return text.length >= 2 ? text : undefined;
}

/** Adds a request, newest first. The same words asked again are moved to the front, not listed twice. */
export function addRequest(data: RequestsData, text: string, now: Date): RequestsData {
  const wanted = text.toLowerCase();
  const rest = data.requests.filter((entry) => entry.text.toLowerCase() !== wanted);
  return {
    requests: [{ text, at: now.toISOString() }, ...rest].slice(0, REQUESTS_KEPT),
    consentAt: data.consentAt ?? now.toISOString(),
    consentVersion: data.consentVersion ?? REQUESTS_CONSENT_VERSION,
  };
}

/** What was saved, read defensively: anything unexpected is treated as nothing saved. */
export function parseRequests(raw: string | null): RequestsData {
  if (raw === null) return EMPTY_REQUESTS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_REQUESTS;
    const record = parsed as Record<string, unknown>;
    const requests = Array.isArray(record.requests)
      ? record.requests.flatMap((entry): ShopRequest[] => {
          if (typeof entry !== 'object' || entry === null) return [];
          const item = entry as Record<string, unknown>;
          return typeof item.text === 'string' && typeof item.at === 'string'
            ? [{ text: item.text, at: item.at }]
            : [];
        })
      : [];
    return {
      requests: requests.slice(0, REQUESTS_KEPT),
      consentAt:
        requests.length > 0 && typeof record.consentAt === 'string' ? record.consentAt : null,
      consentVersion:
        requests.length > 0 && typeof record.consentVersion === 'string'
          ? record.consentVersion
          : null,
    };
  } catch {
    return EMPTY_REQUESTS;
  }
}

export function serializeRequests(data: RequestsData): string {
  return JSON.stringify(data);
}
