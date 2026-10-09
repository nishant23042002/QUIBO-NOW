import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SUBSTITUTION,
  choiceOf,
  parseSubstitution,
  serialiseSubstitution,
  withFallback,
  withOverride,
} from './substitution';

describe('choiceOf', () => {
  it('is the fallback unless the pack has a choice of its own', () => {
    const s = withOverride(DEFAULT_SUBSTITUTION, 'milk:500ml', 'call');
    expect(choiceOf(s, 'milk:500ml')).toBe('call');
    expect(choiceOf(s, 'tomato:loose')).toBe('swap');
  });
});

describe('withOverride', () => {
  it('leaves no exception when the choice is what everything else gets', () => {
    const s = withOverride(DEFAULT_SUBSTITUTION, 'milk:500ml', 'remove');
    expect(s.overrides).toEqual({ 'milk:500ml': 'remove' });
    expect(withOverride(s, 'milk:500ml', 'swap').overrides).toEqual({});
  });
});

describe('withFallback', () => {
  it('drops the exceptions that now agree with the new fallback and keeps the rest', () => {
    let s = withOverride(DEFAULT_SUBSTITUTION, 'milk:500ml', 'remove');
    s = withOverride(s, 'eggs:6pcs', 'call');
    const next = withFallback(s, 'remove');
    expect(next.fallback).toBe('remove');
    expect(next.overrides).toEqual({ 'eggs:6pcs': 'call' });
  });
});

describe('saving the choices', () => {
  it('round-trips', () => {
    const s = withFallback(withOverride(DEFAULT_SUBSTITUTION, 'milk:500ml', 'call'), 'remove');
    expect(parseSubstitution(serialiseSubstitution(s))).toEqual(s);
  });

  it('reads anything unreadable as the default, and ignores choices it does not know', () => {
    for (const bad of [null, 'nope', '[]', '{"fallback":"fly"}']) {
      expect(parseSubstitution(bad)).toEqual(DEFAULT_SUBSTITUTION);
    }
    expect(
      parseSubstitution('{"fallback":"call","overrides":{"a":"remove","b":"fly","c":"call"}}'),
    ).toEqual({ fallback: 'call', overrides: { a: 'remove' } });
  });
});
