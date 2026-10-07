import { TownSchema } from '@quibo/contracts';
import { describe, expect, it } from 'vitest';
import { darkTown, partnerTown, towns } from './towns';

describe('town fixtures', () => {
  it.each([
    ['partnerTown', partnerTown],
    ['darkTown', darkTown],
  ])('%s satisfies the Town contract', (_name, town) => {
    expect(TownSchema.safeParse(town).success).toBe(true);
  });

  it('are one town in each fulfilment mode', () => {
    expect(partnerTown.fulfilmentMode).toBe('partner');
    expect(darkTown.fulfilmentMode).toBe('dark');
  });

  it('have different ids, so tests can tell the towns apart', () => {
    expect(partnerTown.id).not.toBe(darkTown.id);
  });

  it('are exposed together as `towns`', () => {
    expect(towns.partner).toBe(partnerTown);
    expect(towns.dark).toBe(darkTown);
  });
});
