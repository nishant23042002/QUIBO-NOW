/**
 * The one-time code, for the mock sign-in. A real code comes by text message from the server (Phase 2); until then there is one
 * fixed test code, kept here with the other fixtures and never shown on a screen or written to a log. These rules are the ones the
 * real flow will keep: a code lasts a few minutes, a few wrong tries are allowed, and a new one can be asked for after a short wait.
 */

/** The test code. It is a fixture, not a secret: the mock accepts nothing else. */
export const TEST_CODE = '123456';
export const CODE_LENGTH = 6;
/** How long a code works. */
export const CODE_TTL_MS = 5 * 60_000;
/** How long before a new code can be asked for. */
export const RESEND_AFTER_MS = 30_000;
/** How many wrong codes are allowed before the shopper has to ask for a new one. */
export const MAX_TRIES = 5;

export interface OtpState {
  /** When the code was sent, in milliseconds. */
  sentAt: number;
  /** Wrong codes so far. */
  wrong: number;
}

export type OtpResult =
  { kind: 'ok' } | { kind: 'wrong'; left: number } | { kind: 'expired' } | { kind: 'locked' };

/** A code has just been sent. */
export function sendCode(now: number): OtpState {
  return { sentAt: now, wrong: 0 };
}

/** Only the digits of what was typed, up to the length of a code. */
export function codeDigits(typed: string): string {
  return typed.replace(/\D/g, '').slice(0, CODE_LENGTH);
}

/**
 * Checks a typed code. An old code is `expired` whatever was typed, and after too many wrong tries the shopper is `locked` out of
 * this code, even if they now type the right one: a new code is needed. The state comes back with the wrong try counted.
 */
export function checkCode(
  state: OtpState,
  typed: string,
  now: number,
): { result: OtpResult; state: OtpState } {
  if (now - state.sentAt > CODE_TTL_MS) return { result: { kind: 'expired' }, state };
  if (state.wrong >= MAX_TRIES) return { result: { kind: 'locked' }, state };
  if (codeDigits(typed) === TEST_CODE) return { result: { kind: 'ok' }, state };
  const next = { ...state, wrong: state.wrong + 1 };
  return next.wrong >= MAX_TRIES
    ? { result: { kind: 'locked' }, state: next }
    : { result: { kind: 'wrong', left: MAX_TRIES - next.wrong }, state: next };
}

/** How many whole seconds are left before a new code can be asked for. 0 once it can. */
export function resendInSeconds(state: OtpState, now: number): number {
  return Math.max(0, Math.ceil((state.sentAt + RESEND_AFTER_MS - now) / 1000));
}
