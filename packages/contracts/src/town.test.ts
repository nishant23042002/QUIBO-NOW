import { describe, expect, it } from 'vitest';
import { HealthResponseSchema } from './health';
import { TownIdSchema } from './ids';
import { TownSchema } from './town';

const VALID_ID = '0192f3c4-7a10-7c3e-8b21-5d6a4e9f0a11';
const validTown = {
  id: VALID_ID,
  name: 'Demo Town',
  state: 'Demo State',
  status: 'active',
  fulfilmentMode: 'partner',
};

describe('TownIdSchema', () => {
  it('accepts a UUID', () => {
    expect(TownIdSchema.safeParse(VALID_ID).success).toBe(true);
  });

  it.each(['', 'town-1', '1', '0192f3c4-7a10-7c3e-8b21', null, undefined, 42])(
    'rejects %j',
    (bad) => {
      expect(TownIdSchema.safeParse(bad).success).toBe(false);
    },
  );
});

describe('TownSchema', () => {
  it('accepts a valid town in every fulfilment mode', () => {
    for (const fulfilmentMode of ['partner', 'dark', 'hybrid']) {
      expect(TownSchema.safeParse({ ...validTown, fulfilmentMode }).success).toBe(true);
    }
  });

  it.each([
    ['a bad id', { id: 'nope' }],
    ['an unknown fulfilment mode', { fulfilmentMode: 'both' }],
    ['an unknown status', { status: 'live' }],
    ['an empty name', { name: '' }],
    ['an empty state', { state: '' }],
  ])('rejects %s', (_label, patch) => {
    expect(TownSchema.safeParse({ ...validTown, ...patch }).success).toBe(false);
  });

  it('rejects a missing field', () => {
    const { fulfilmentMode: _omitted, ...withoutMode } = validTown;
    expect(TownSchema.safeParse(withoutMode).success).toBe(false);
  });
});

describe('HealthResponseSchema', () => {
  it('accepts ok', () => {
    expect(HealthResponseSchema.safeParse({ status: 'ok' }).success).toBe(true);
  });

  it.each([{ status: 'down' }, { status: 'OK' }, {}, null, 'ok'])('rejects %j', (bad) => {
    expect(HealthResponseSchema.safeParse(bad).success).toBe(false);
  });
});
