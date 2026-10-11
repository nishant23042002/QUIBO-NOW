import { describe, expect, it } from 'vitest';
import { DELIVERY_ART, artTint } from './deliveryArt';

describe('artTint', () => {
  it('leaves the classic full-colour scooter as drawn, free or not', () => {
    expect(artTint('classic', false)).toBeNull();
    expect(artTint('classic', true)).toBeNull();
  });

  it('paints the mono scooter white, and pistachio once free delivery is reached', () => {
    expect(artTint('mono', false)).toBe('onChrome');
    expect(artTint('mono', true)).toBe('accent');
  });

  it('names one of the two pictures', () => {
    expect(['classic', 'mono']).toContain(DELIVERY_ART);
  });
});
