import { describe, expect, it } from 'vitest';
import {
  EMPTY_REQUESTS,
  REQUESTS_CONSENT_VERSION,
  REQUESTS_KEPT,
  REQUEST_MAX_LENGTH,
  addRequest,
  cleanRequest,
  parseRequests,
  serializeRequests,
} from './askShops';

const NOON = new Date('2026-10-14T06:30:00.000Z');
const LATER = new Date('2026-10-15T06:30:00.000Z');

describe('cleanRequest', () => {
  it('trims, makes one line and keeps what was typed', () => {
    expect(cleanRequest('  ragi   flour\n1 kg ')).toBe('ragi flour 1 kg');
  });

  it('refuses nothing, one letter and only spaces', () => {
    expect(cleanRequest('')).toBeUndefined();
    expect(cleanRequest('a')).toBeUndefined();
    expect(cleanRequest('   ')).toBeUndefined();
  });

  it('cuts a long request at the limit', () => {
    expect(cleanRequest('x'.repeat(REQUEST_MAX_LENGTH + 40))).toHaveLength(REQUEST_MAX_LENGTH);
  });
});

describe('addRequest', () => {
  it('keeps the request with its time and records when and under which wording they agreed', () => {
    const next = addRequest(EMPTY_REQUESTS, 'ragi flour', NOON);
    expect(next.requests).toEqual([{ text: 'ragi flour', at: NOON.toISOString() }]);
    expect(next.consentAt).toBe(NOON.toISOString());
    expect(next.consentVersion).toBe(REQUESTS_CONSENT_VERSION);
  });

  it('keeps the first time they agreed and puts the newest first', () => {
    const first = addRequest(EMPTY_REQUESTS, 'ragi flour', NOON);
    const second = addRequest(first, 'jaggery', LATER);
    expect(second.requests.map((entry) => entry.text)).toEqual(['jaggery', 'ragi flour']);
    expect(second.consentAt).toBe(NOON.toISOString());
  });

  it('moves the same words asked again to the front instead of listing them twice', () => {
    const first = addRequest(addRequest(EMPTY_REQUESTS, 'ragi flour', NOON), 'jaggery', NOON);
    const again = addRequest(first, 'Ragi Flour', LATER);
    expect(again.requests.map((entry) => entry.text)).toEqual(['Ragi Flour', 'jaggery']);
  });

  it('keeps only the newest few', () => {
    let data = EMPTY_REQUESTS;
    for (let index = 0; index < REQUESTS_KEPT + 5; index += 1) {
      data = addRequest(data, `thing ${index}`, NOON);
    }
    expect(data.requests).toHaveLength(REQUESTS_KEPT);
    expect(data.requests[0]?.text).toBe(`thing ${REQUESTS_KEPT + 4}`);
  });
});

describe('parseRequests and serializeRequests', () => {
  it('reads back what was saved', () => {
    const data = addRequest(EMPTY_REQUESTS, 'ragi flour', NOON);
    expect(parseRequests(serializeRequests(data))).toEqual(data);
  });

  it('treats nothing, rubbish and the wrong shape as nothing saved', () => {
    expect(parseRequests(null)).toEqual(EMPTY_REQUESTS);
    expect(parseRequests('{oops')).toEqual(EMPTY_REQUESTS);
    expect(parseRequests('7')).toEqual(EMPTY_REQUESTS);
    expect(parseRequests('{"requests":"x"}')).toEqual(EMPTY_REQUESTS);
  });

  it('drops entries that are not a text and a time', () => {
    const parsed = parseRequests(
      '{"requests":[{"text":"ragi","at":"2026-10-14T00:00:00.000Z"},{"text":3},null]}',
    );
    expect(parsed.requests).toHaveLength(1);
  });
});
