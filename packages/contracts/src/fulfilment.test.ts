import { describe, expect, it } from 'vitest';
import {
  FULFILMENT_MODES,
  FulfilmentModeSchema,
  STOCK_MODES,
  STORE_TYPES,
  StockModeSchema,
  StoreTypeSchema,
} from './fulfilment';

// Values that look plausible but must never be accepted by any of the three enums.
const NOT_STRINGS_OR_BLANK = [
  '',
  ' ',
  null,
  undefined,
  0,
  1,
  true,
  false,
  {},
  [],
  ['partner'],
  { mode: 'partner' },
];

const cases = [
  {
    name: 'FulfilmentMode',
    schema: FulfilmentModeSchema,
    values: FULFILMENT_MODES,
    expected: ['partner', 'dark', 'hybrid'],
    invalid: ['both', 'Partner', 'DARK', ' hybrid', 'dark ', 'toggle', 'counted', 'store'],
  },
  {
    name: 'StockMode',
    schema: StockModeSchema,
    values: STOCK_MODES,
    expected: ['toggle', 'counted'],
    invalid: ['Toggle', 'COUNTED', 'counted ', 'count', 'partner', 'dark', 'hybrid'],
  },
  {
    name: 'StoreType',
    schema: StoreTypeSchema,
    values: STORE_TYPES,
    expected: ['partner', 'dark'],
    // 'hybrid' is a valid town FulfilmentMode but never a type of single store.
    invalid: ['hybrid', 'Partner', 'DARK', 'dark ', 'toggle', 'counted', 'company'],
  },
] as const;

describe.each(cases)('$name', ({ schema, values, expected, invalid }) => {
  it('lists exactly the documented values', () => {
    expect([...values]).toEqual([...expected]);
    expect([...schema.options]).toEqual([...expected]);
  });

  it.each(expected)('accepts %s', (value) => {
    expect(schema.safeParse(value)).toEqual({ success: true, data: value });
  });

  it.each([...invalid, ...NOT_STRINGS_OR_BLANK])('rejects %j', (value) => {
    expect(schema.safeParse(value).success).toBe(false);
  });
});
