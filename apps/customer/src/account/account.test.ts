import { describe, expect, it } from 'vitest';
import {
  CONSENT_VERSION,
  NEW_ACCOUNT,
  chooseLanguage,
  logOut,
  parseAccount,
  serialiseAccount,
  signIn,
  skipSignIn,
  stageOf,
} from './account';

const NOW = new Date('2026-10-09T10:00:00.000Z');

describe('stageOf', () => {
  it('goes language, phone, then the code, then done', () => {
    expect(stageOf(NEW_ACCOUNT, null)).toBe('language');
    const chosen = chooseLanguage(NEW_ACCOUNT);
    expect(stageOf(chosen, null)).toBe('phone');
    expect(stageOf(chosen, '9876543210')).toBe('otp');
    expect(stageOf(signIn(chosen, '9876543210', NOW), null)).toBe('done');
  });

  it('is done for a tester who skipped', () => {
    expect(stageOf(skipSignIn(NEW_ACCOUNT), null)).toBe('done');
  });

  it('does not show the code step before a language is chosen', () => {
    expect(stageOf(NEW_ACCOUNT, '9876543210')).toBe('language');
  });
});

describe('signing in and out', () => {
  it('logs when the shopper agreed, and to which wording', () => {
    const data = signIn(NEW_ACCOUNT, '9876543210', NOW);
    expect(data.consentAt).toBe('2026-10-09T10:00:00.000Z');
    expect(data.consentVersion).toBe(CONSENT_VERSION);
  });

  it('forgets the number and the agreement on log out but keeps the language', () => {
    const out = logOut(signIn(NEW_ACCOUNT, '9876543210', NOW));
    expect(out).toEqual({ ...NEW_ACCOUNT, languageChosen: true });
    expect(stageOf(out, null)).toBe('phone');
  });

  it('ends a skip on log out', () => {
    expect(stageOf(logOut(skipSignIn(NEW_ACCOUNT)), null)).toBe('phone');
  });
});

describe('saving the account', () => {
  it('round-trips', () => {
    const data = signIn(chooseLanguage(NEW_ACCOUNT), '9876543210', NOW);
    expect(parseAccount(serialiseAccount(data))).toEqual(data);
  });

  it('is a new account when nothing is saved or what is saved cannot be read', () => {
    for (const bad of [null, 'nope', '[]', '{"v":9}'])
      expect(parseAccount(bad)).toEqual(NEW_ACCOUNT);
  });

  it('ignores a phone number that is not ten digits, and the agreement that went with it', () => {
    const text = JSON.stringify({ v: 1, languageChosen: true, phone: '12345', consentAt: 'x' });
    expect(parseAccount(text)).toEqual({ ...NEW_ACCOUNT, languageChosen: true });
  });
});
