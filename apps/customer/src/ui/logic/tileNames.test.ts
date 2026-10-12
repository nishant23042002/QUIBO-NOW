import { describe, expect, it } from 'vitest';
import { tileNameLines } from './tileNames';

describe('tileNameLines', () => {
  it('draws one line for a short name, as full as the name is', () => {
    expect(tileNameLines('Atta')).toEqual([0.4]);
    expect(tileNameLines('Curd')).toHaveLength(1);
  });

  it('breaks at a space into at most two lines', () => {
    expect(tileNameLines('Daily vegetables')).toHaveLength(2);
    expect(tileNameLines('Potato and onion and more things').length).toBeLessThanOrEqual(2);
  });

  it('keeps every line between about a third and nearly the whole width', () => {
    for (const name of ['A', 'Hello world again and again', 'Extraordinarilylongword']) {
      for (const share of tileNameLines(name)) {
        expect(share).toBeGreaterThanOrEqual(0.35);
        expect(share).toBeLessThanOrEqual(0.95);
      }
    }
  });

  it('counts letters, not bytes, so Hindi and Marathi names are measured fairly', () => {
    expect(tileNameLines('दैनिक सब्ज़ियाँ')).toHaveLength(2);
    expect(tileNameLines('आटा')).toEqual([0.35]);
  });

  it('gives a blank name one short line', () => {
    expect(tileNameLines('   ')).toEqual([0.35]);
  });
});
