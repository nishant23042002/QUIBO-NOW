import { describe, expect, it } from 'vitest';
import { parseMode, resolveScheme, toggledMode } from './mode';

describe('resolveScheme', () => {
  it('follows the phone while the mode is "system"', () => {
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', 'light')).toBe('light');
  });

  it('uses light when the phone says nothing useful', () => {
    expect(resolveScheme('system', null)).toBe('light');
    expect(resolveScheme('system', undefined)).toBe('light');
    expect(resolveScheme('system', 'unspecified')).toBe('light');
  });

  it('lets an explicit choice win over the phone', () => {
    expect(resolveScheme('light', 'dark')).toBe('light');
    expect(resolveScheme('dark', 'light')).toBe('dark');
    expect(resolveScheme('dark', null)).toBe('dark');
  });
});

describe('parseMode', () => {
  it('accepts the three stored values', () => {
    expect(parseMode('light')).toBe('light');
    expect(parseMode('dark')).toBe('dark');
    expect(parseMode('system')).toBe('system');
  });

  it('treats nothing stored, or anything unexpected, as "system"', () => {
    for (const bad of [null, undefined, '', 'DARK', 'Light', 'blue', ' dark', '1']) {
      expect(parseMode(bad)).toBe('system');
    }
  });
});

describe('toggledMode', () => {
  it('switches to the opposite of the theme being shown', () => {
    expect(toggledMode('light')).toBe('dark');
    expect(toggledMode('dark')).toBe('light');
  });

  it('never goes back to "system", so a tap is always an explicit choice', () => {
    for (const scheme of ['light', 'dark'] as const) {
      expect(toggledMode(scheme)).not.toBe('system');
    }
  });
});
