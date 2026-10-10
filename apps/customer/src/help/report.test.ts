import { describe, expect, it } from 'vitest';
import {
  EMPTY_DRAFT,
  NOTE_MAX,
  asksForItems,
  buildReport,
  canSend,
  clampNote,
  parseReports,
  serialiseReports,
  toggleItem,
  type Draft,
} from './report';

const NOW = new Date('2026-10-10T10:00:00.000Z');
const draft = (change: Partial<Draft>): Draft => ({ ...EMPTY_DRAFT, ...change });

describe('asksForItems', () => {
  it('is true for the problems that are about things in the order', () => {
    expect(asksForItems('missing')).toBe(true);
    expect(asksForItems('wrong')).toBe(true);
    expect(asksForItems('damaged')).toBe(true);
    expect(asksForItems('payment')).toBe(false);
    expect(asksForItems('other')).toBe(false);
  });
});

describe('canSend', () => {
  it('needs an order and a kind of problem', () => {
    expect(canSend(EMPTY_DRAFT)).toBe(false);
    expect(canSend(draft({ orderId: 'o1' }))).toBe(false);
    expect(canSend(draft({ kind: 'payment' }))).toBe(false);
    expect(canSend(draft({ orderId: 'o1', kind: 'payment' }))).toBe(true);
  });

  it('needs at least one thing when the problem is about things', () => {
    expect(canSend(draft({ orderId: 'o1', kind: 'missing' }))).toBe(false);
    expect(canSend(draft({ orderId: 'o1', kind: 'missing', itemIds: ['milk:500ml'] }))).toBe(true);
  });
});

describe('toggleItem', () => {
  it('picks one, and puts it back', () => {
    expect(toggleItem([], 'a')).toEqual(['a']);
    expect(toggleItem(['a', 'b'], 'a')).toEqual(['b']);
  });
});

describe('buildReport', () => {
  it('is nothing for a draft that cannot be sent', () => {
    expect(buildReport(EMPTY_DRAFT, 'r1', NOW)).toBeNull();
  });

  it('keeps the order, the kind, the things and a trimmed note', () => {
    const report = buildReport(
      draft({ orderId: 'o1', kind: 'damaged', itemIds: ['eggs:6pcs'], note: '  two cracked  ' }),
      'r1',
      NOW,
    );
    expect(report).toEqual({
      id: 'r1',
      orderId: 'o1',
      kind: 'damaged',
      itemIds: ['eggs:6pcs'],
      note: 'two cracked',
      at: NOW.toISOString(),
    });
  });

  it('forgets things ticked earlier when the kind of problem is not about things', () => {
    const report = buildReport(
      draft({ orderId: 'o1', kind: 'payment', itemIds: ['eggs:6pcs'] }),
      'r1',
      NOW,
    );
    expect(report?.itemIds).toEqual([]);
  });

  it('cuts a long note to the limit', () => {
    expect(clampNote('x'.repeat(NOTE_MAX + 50))).toHaveLength(NOTE_MAX);
    const report = buildReport(
      draft({ orderId: 'o1', kind: 'other', note: 'y'.repeat(500) }),
      'r1',
      NOW,
    );
    expect(report?.note).toHaveLength(NOTE_MAX);
  });
});

describe('saving and reading reports back', () => {
  const report = buildReport(
    draft({ orderId: 'o1', kind: 'missing', itemIds: ['milk:500ml'], note: 'no milk' }),
    'r1',
    NOW,
  );

  it('gives back what was saved', () => {
    expect(report).not.toBeNull();
    if (report === null) return;
    expect(parseReports(serialiseReports([report]))).toEqual([report]);
  });

  it('is empty when nothing was saved or the saving is damaged', () => {
    expect(parseReports(null)).toEqual([]);
    expect(parseReports('nope')).toEqual([]);
    expect(parseReports('{"v":9,"reports":[]}')).toEqual([]);
  });

  it('drops an entry that is not a well-formed report', () => {
    if (report === null) return;
    const bad = [
      { ...report, kind: 'nonsense' },
      { ...report, at: 'yesterday' },
      { ...report, itemIds: [1] },
      7,
      null,
    ];
    expect(parseReports(JSON.stringify({ v: 1, reports: [...bad, report] }))).toEqual([report]);
  });

  it('keeps the newest fifty', () => {
    if (report === null) return;
    const many = Array.from({ length: 60 }, (_, index) => ({ ...report, id: `r${index}` }));
    expect(parseReports(serialiseReports(many))).toHaveLength(50);
  });
});
