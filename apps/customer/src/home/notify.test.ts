import { describe, expect, it } from 'vitest';
import {
  EMPTY_NOTIFY,
  NOTIFY_CONSENT_VERSION,
  groupNotifyId,
  isNotified,
  mergeNotify,
  parseNotify,
  serializeNotify,
  toggleNotify,
} from './notify';

const NOON = new Date('2026-10-14T06:30:00.000Z');
const LATER = new Date('2026-10-15T06:30:00.000Z');

describe('toggleNotify', () => {
  it('turns it on and records when and under which wording the shopper agreed', () => {
    const next = toggleNotify(EMPTY_NOTIFY, 'meatFish', NOON);
    expect(isNotified(next, 'meatFish')).toBe(true);
    expect(next.consentAt).toBe(NOON.toISOString());
    expect(next.consentVersion).toBe(NOTIFY_CONSENT_VERSION);
  });

  it('keeps the first time they agreed when a second thing is turned on', () => {
    const first = toggleNotify(EMPTY_NOTIFY, 'meatFish', NOON);
    const second = toggleNotify(first, 'drinks', LATER);
    expect(second.ids).toEqual(['meatFish', 'drinks']);
    expect(second.consentAt).toBe(NOON.toISOString());
  });

  it('turns it off again, and still remembers when they first agreed', () => {
    const on = toggleNotify(EMPTY_NOTIFY, 'meatFish', NOON);
    const off = toggleNotify(on, 'meatFish', LATER);
    expect(isNotified(off, 'meatFish')).toBe(false);
    expect(off.consentAt).toBe(NOON.toISOString());
  });

  it('names a whole group apart from a category', () => {
    expect(groupNotifyId('care')).toBe('group:care');
    expect(groupNotifyId('care')).not.toBe('care');
  });
});

describe('parseNotify and serializeNotify', () => {
  it('reads back what was saved', () => {
    const data = toggleNotify(toggleNotify(EMPTY_NOTIFY, 'beauty', NOON), 'group:tech', LATER);
    expect(parseNotify(serializeNotify(data))).toEqual(data);
  });

  it('treats nothing, rubbish and the wrong shape as nothing saved', () => {
    expect(parseNotify(null)).toEqual(EMPTY_NOTIFY);
    expect(parseNotify('{not json')).toEqual(EMPTY_NOTIFY);
    expect(parseNotify('42')).toEqual(EMPTY_NOTIFY);
    expect(parseNotify('{"ids":"beauty"}')).toEqual(EMPTY_NOTIFY);
  });

  it('drops entries that are not text and repeats', () => {
    const parsed = parseNotify(
      '{"ids":["beauty",3,"beauty",null],"consentAt":"2026-10-14T00:00:00.000Z"}',
    );
    expect(parsed.ids).toEqual(['beauty']);
  });

  it('does not keep a consent time when nothing is turned on', () => {
    expect(parseNotify('{"ids":[],"consentAt":"2026-10-14T00:00:00.000Z"}').consentAt).toBeNull();
  });
});

describe('mergeNotify', () => {
  it('keeps what was saved and what was tapped before it was read back', () => {
    const saved = toggleNotify(EMPTY_NOTIFY, 'beauty', NOON);
    const current = toggleNotify(EMPTY_NOTIFY, 'drinks', LATER);
    const merged = mergeNotify(saved, current);
    expect([...merged.ids].sort()).toEqual(['beauty', 'drinks']);
    expect(merged.consentAt).toBe(NOON.toISOString());
  });
});
