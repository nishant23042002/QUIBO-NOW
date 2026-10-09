import { describe, expect, it } from 'vitest';
import { careOf } from './care';

describe('careOf', () => {
  it('treats eggs as fragile even though they are dairy', () => {
    expect(careOf('eggs', 'dairy')).toBe('fragile');
  });

  it('keeps milk and the like cold', () => {
    expect(careOf('milk', 'dairy')).toBe('chilled');
    expect(careOf('paneer', 'dairy')).toBe('chilled');
  });

  it('gives each other category its own class', () => {
    expect(careOf('atta', 'staples')).toBe('heavy');
    expect(careOf('tomato', 'vegetables')).toBe('fresh');
    expect(careOf('banana', 'fruits')).toBe('fresh');
    expect(careOf('chips', 'snacks')).toBe('standard');
  });
});
