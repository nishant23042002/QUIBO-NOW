import { describe, expect, it } from 'vitest';
import {
  CODE_TTL_MS,
  MAX_TRIES,
  RESEND_AFTER_MS,
  TEST_CODE,
  checkCode,
  codeDigits,
  resendInSeconds,
  sendCode,
} from './otp';

const T0 = 1_000_000;

describe('codeDigits', () => {
  it('keeps only digits, up to six', () => {
    expect(codeDigits('12 34-56')).toBe('123456');
    expect(codeDigits('1234567890')).toBe('123456');
    expect(codeDigits('ab')).toBe('');
  });
});

describe('checkCode', () => {
  it('accepts the right code, even with spaces typed in it', () => {
    expect(checkCode(sendCode(T0), TEST_CODE, T0 + 1000).result).toEqual({ kind: 'ok' });
    expect(checkCode(sendCode(T0), '123 456', T0 + 1000).result).toEqual({ kind: 'ok' });
  });

  it('counts a wrong code and says how many tries are left', () => {
    const first = checkCode(sendCode(T0), '000000', T0 + 1000);
    expect(first.result).toEqual({ kind: 'wrong', left: MAX_TRIES - 1 });
    expect(first.state.wrong).toBe(1);
  });

  it('locks after too many wrong codes, and then refuses even the right one', () => {
    let state = sendCode(T0);
    let last = checkCode(state, '000000', T0);
    for (let i = 1; i < MAX_TRIES; i += 1) {
      state = last.state;
      last = checkCode(state, '000000', T0);
    }
    expect(last.result).toEqual({ kind: 'locked' });
    expect(checkCode(last.state, TEST_CODE, T0).result).toEqual({ kind: 'locked' });
  });

  it('expires after a few minutes, whatever is typed', () => {
    const late = T0 + CODE_TTL_MS + 1;
    expect(checkCode(sendCode(T0), TEST_CODE, late).result).toEqual({ kind: 'expired' });
    expect(checkCode(sendCode(T0), TEST_CODE, T0 + CODE_TTL_MS).result).toEqual({ kind: 'ok' });
  });

  it('does not count a wrong code against a code that has expired', () => {
    const state = sendCode(T0);
    expect(checkCode(state, '000000', T0 + CODE_TTL_MS + 1).state).toBe(state);
  });
});

describe('resendInSeconds', () => {
  it('counts down to zero and stays there', () => {
    const state = sendCode(T0);
    expect(resendInSeconds(state, T0)).toBe(30);
    expect(resendInSeconds(state, T0 + 1)).toBe(30);
    expect(resendInSeconds(state, T0 + 20_500)).toBe(10);
    expect(resendInSeconds(state, T0 + RESEND_AFTER_MS)).toBe(0);
    expect(resendInSeconds(state, T0 + RESEND_AFTER_MS * 5)).toBe(0);
  });
});
