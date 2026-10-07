import { describe, expect, it } from 'vitest';
import * as contracts from './index';

describe('package index', () => {
  it('exports the whole public surface from one entry point', () => {
    expect(Object.keys(contracts).sort()).toEqual(
      [
        'FULFILMENT_MODES',
        'FulfilmentModeSchema',
        'HealthResponseSchema',
        'MoneySchema',
        'ORDER_STATUSES',
        'ORDER_TRANSITIONS',
        'OrderStatusSchema',
        'STOCK_MODES',
        'STORE_TYPES',
        'StockModeSchema',
        'StoreTypeSchema',
        'TOWN_STATUSES',
        'TownIdSchema',
        'TownSchema',
        'TownStatusSchema',
        'add',
        'formatRupees',
        'money',
        'multiplyByQuantity',
        'subtract',
      ].sort(),
    );
  });
});
