import { describe, expect, it } from 'vitest';
import { textLines } from './textLines';

describe('textLines', () => {
  it('puts a short sentence on one line', () => {
    expect(textLines('Order again', 300, 16)).toBe(1);
  });

  it('wraps a long sentence by the width it has', () => {
    const sentence = 'We pack and send it right away, a little longer in rush hour or rain.';
    expect(textLines(sentence, 330, 16)).toBe(2);
    expect(textLines(sentence, 200, 16)).toBe(3);
  });

  it('gives Devanagari more room per letter', () => {
    const text = 'आप बदल सकते हैं या रद्द कर सकते हैं जब तक पैकिंग शुरू नहीं होती';
    expect(textLines(text, 300, 16, 'devanagari')).toBeGreaterThanOrEqual(
      textLines(text, 300, 16, 'latin'),
    );
  });

  it('never returns less than one line', () => {
    expect(textLines('', 300, 16)).toBe(1);
    expect(textLines('Hi', 0, 16)).toBe(1);
  });
});
