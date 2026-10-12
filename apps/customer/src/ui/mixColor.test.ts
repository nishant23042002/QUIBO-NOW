import { describe, expect, it } from 'vitest';
import { mixColor } from './mixColor';

describe('mixColor', () => {
  it('is the first colour at 0 and the second at 1', () => {
    expect(mixColor('#DCE8F5', '#F8F4F7', 0)).toBe('#DCE8F5');
    expect(mixColor('#DCE8F5', '#F8F4F7', 1)).toBe('#F8F4F7');
  });

  it('is halfway between the two at 0.5, channel by channel', () => {
    expect(mixColor('#000000', '#FFFFFF', 0.5)).toBe('#808080');
    expect(mixColor('#DCE8F5', '#F8F4F7', 0.5)).toBe('#EAEEF6');
  });

  it('keeps the amount inside 0 and 1', () => {
    expect(mixColor('#102030', '#F0E0D0', -3)).toBe('#102030');
    expect(mixColor('#102030', '#F0E0D0', 7)).toBe('#F0E0D0');
  });

  it('returns the first colour when either is not a six-digit hex colour', () => {
    expect(mixColor('rgba(0, 0, 0, 0.5)', '#FFFFFF', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
    expect(mixColor('#FFF', '#000000', 0.5)).toBe('#FFF');
    expect(mixColor('', '#000000', 0.5)).toBe('');
  });
});
