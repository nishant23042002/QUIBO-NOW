import { describe, expect, it } from 'vitest';
import {
  AT_TOP_BELOW,
  JUMP_HIDE_AT,
  JUMP_SHOW_AT,
  SCROLLED_AT,
  jumpVisible,
  scrolledPast,
} from './jumpToTop';

describe('jumpVisible', () => {
  it('shows once the page is scrolled past the upper mark and hides below the lower one', () => {
    expect(jumpVisible(JUMP_SHOW_AT, false)).toBe(true);
    expect(jumpVisible(JUMP_SHOW_AT + 500, false)).toBe(true);
    expect(jumpVisible(JUMP_HIDE_AT, true)).toBe(false);
    expect(jumpVisible(0, true)).toBe(false);
  });

  it('keeps its state between the marks, so it does not flicker around one of them', () => {
    const between = (JUMP_SHOW_AT + JUMP_HIDE_AT) / 2;
    expect(jumpVisible(between, true)).toBe(true);
    expect(jumpVisible(between, false)).toBe(false);
  });
});

describe('scrolledPast', () => {
  it('is true once the page has moved a little, false back at the top, and holds between', () => {
    expect(scrolledPast(0, false)).toBe(false);
    expect(scrolledPast(SCROLLED_AT, false)).toBe(true);
    expect(scrolledPast(AT_TOP_BELOW, true)).toBe(false);
    expect(scrolledPast((SCROLLED_AT + AT_TOP_BELOW) / 2, true)).toBe(true);
    expect(scrolledPast((SCROLLED_AT + AT_TOP_BELOW) / 2, false)).toBe(false);
  });
});
