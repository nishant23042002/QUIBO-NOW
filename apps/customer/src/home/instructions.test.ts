import { describe, expect, it } from 'vitest';
import {
  NOTE_MAX,
  clampNote,
  parseInstructions,
  serialiseInstructions,
  toggleInstruction,
} from './instructions';

describe('toggleInstruction', () => {
  it('turns a choice on and off, keeping the usual order whatever order they were picked in', () => {
    const one = toggleInstruction([], 'pets');
    expect(one).toEqual(['pets']);
    const two = toggleInstruction(one, 'leaveAtDoor');
    expect(two).toEqual(['leaveAtDoor', 'pets']);
    expect(toggleInstruction(two, 'pets')).toEqual(['leaveAtDoor']);
  });
});

describe('clampNote', () => {
  it('cuts a note to the longest allowed and leaves a shorter one alone', () => {
    expect(clampNote('green gate')).toBe('green gate');
    expect(clampNote('x'.repeat(NOTE_MAX + 30))).toHaveLength(NOTE_MAX);
  });
});

describe('saving instructions', () => {
  it('round-trips', () => {
    const value = { chips: ['noBell', 'pets'] as const, note: 'Second floor' };
    expect(
      parseInstructions(serialiseInstructions({ chips: [...value.chips], note: value.note })),
    ).toEqual({ chips: ['noBell', 'pets'], note: 'Second floor' });
  });

  it('reads anything unreadable as no instructions, and ignores choices it does not know', () => {
    const none = { chips: [], note: '' };
    for (const bad of [null, 'nope', '[]', '{"chips":5}']) {
      expect(parseInstructions(bad)).toEqual(none);
    }
    expect(parseInstructions('{"chips":["noBell","fly","pets"],"note":7}')).toEqual({
      chips: ['noBell', 'pets'],
      note: '',
    });
  });
});
