/**
 * Who is using the app, as far as the first-run flow needs to know: whether a language has been chosen, which phone number has been
 * checked, and when the shopper agreed to the terms. Nothing else about a person is kept here.
 */

/** The wording of the consent line the shopper agreed to. Change it when the wording changes, so the log says which one. */
export const CONSENT_VERSION = '2026-10-v1';

export interface AccountData {
  languageChosen: boolean;
  /** The ten digits of the phone number that has been checked with a code. Null before that. */
  phone: string | null;
  /** When they agreed, and to which wording. Both null before that. */
  consentAt: string | null;
  consentVersion: string | null;
  /** A tester passed the sign-in by hand (development builds only). */
  skipped: boolean;
}

export const NEW_ACCOUNT: AccountData = {
  languageChosen: false,
  phone: null,
  consentAt: null,
  consentVersion: null,
  skipped: false,
};

/** Where the shopper is in the first-run flow. `otp` is only while a code is being checked: it is not kept. */
export type Stage = 'language' | 'phone' | 'otp' | 'done';

/** The step to show. `pendingPhone` is the number a code was just sent to, if one was. */
export function stageOf(data: AccountData, pendingPhone: string | null): Stage {
  if (data.phone !== null || data.skipped) return 'done';
  if (!data.languageChosen) return 'language';
  return pendingPhone === null ? 'phone' : 'otp';
}

export function chooseLanguage(data: AccountData): AccountData {
  return { ...data, languageChosen: true };
}

/** A number has been checked: the shopper is signed in, and their agreement is logged with the time. */
export function signIn(data: AccountData, phone: string, now: Date): AccountData {
  return {
    ...data,
    languageChosen: true,
    phone,
    consentAt: now.toISOString(),
    consentVersion: CONSENT_VERSION,
    skipped: false,
  };
}

/** Passing the sign-in by hand, for testing. */
export function skipSignIn(data: AccountData): AccountData {
  return { ...data, languageChosen: true, skipped: true };
}

/** Signing out forgets the number and the agreement, but keeps the language: it is the phone's, not the person's. */
export function logOut(data: AccountData): AccountData {
  return { ...data, phone: null, consentAt: null, consentVersion: null, skipped: false };
}

const VERSION = 1;

export function serialiseAccount(data: AccountData): string {
  return JSON.stringify({ v: VERSION, ...data });
}

/** The account read back from the phone. Nothing saved, or something unreadable, is a new account: never a crash. */
export function parseAccount(saved: string | null): AccountData {
  if (saved === null) return NEW_ACCOUNT;
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    if (parsed === null || typeof parsed !== 'object' || parsed.v !== VERSION) return NEW_ACCOUNT;
    const phone =
      typeof parsed.phone === 'string' && /^\d{10}$/.test(parsed.phone) ? parsed.phone : null;
    return {
      languageChosen: parsed.languageChosen === true,
      phone,
      consentAt: phone !== null && typeof parsed.consentAt === 'string' ? parsed.consentAt : null,
      consentVersion:
        phone !== null && typeof parsed.consentVersion === 'string' ? parsed.consentVersion : null,
      skipped: parsed.skipped === true,
    };
  } catch {
    return NEW_ACCOUNT;
  }
}
