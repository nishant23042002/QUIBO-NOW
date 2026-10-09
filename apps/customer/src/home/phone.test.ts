import { describe, expect, it } from 'vitest';
import { formatPhone, isMobile, phoneDigits } from './phone';

describe('phoneDigits', () => {
  it('keeps only the digits and drops a country code or a leading zero', () => {
    expect(phoneDigits('98765 43210')).toBe('9876543210');
    expect(phoneDigits('+91 98765-43210')).toBe('9876543210');
    expect(phoneDigits('098765 43210')).toBe('9876543210');
  });

  it('leaves a number that is still being typed alone', () => {
    expect(phoneDigits('9876')).toBe('9876');
    expect(phoneDigits('')).toBe('');
  });
});

describe('isMobile', () => {
  it('accepts ten digits starting with 6 to 9', () => {
    for (const ok of ['9876543210', '6000000000', '+91 70000 12345'])
      expect(isMobile(ok)).toBe(true);
  });

  it('rejects the wrong length or a first digit below 6', () => {
    for (const bad of ['', '98765', '98765432101', '5876543210', 'abcdefghij']) {
      expect(isMobile(bad)).toBe(false);
    }
  });
});

describe('formatPhone', () => {
  it('groups a full number in two fives', () => {
    expect(formatPhone('9876543210')).toBe('98765 43210');
    expect(formatPhone('+91 9876543210')).toBe('98765 43210');
  });

  it('does not group a partial number', () => {
    expect(formatPhone('98765')).toBe('98765');
  });
});
