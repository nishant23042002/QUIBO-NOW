import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins class names with a single space', () => {
    expect(cx('a', 'b', 'c')).toBe('a b c');
  });

  it('skips false, null, undefined and empty strings', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
  });

  it('applies a class only when its condition holds', () => {
    const on = true;
    const off = false;
    expect(cx('base', on && 'is-on', off && 'is-off')).toBe('base is-on');
  });

  it('returns an empty string when there is nothing to join', () => {
    expect(cx()).toBe('');
    expect(cx(false, null)).toBe('');
  });
});
