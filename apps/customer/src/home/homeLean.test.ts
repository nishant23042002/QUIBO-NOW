import { describe, expect, it } from 'vitest';
import { HIDDEN_FOR_NEW_CUSTOMER, readLeanSwitch, sectionShown } from './homeLean';

const NEW_CUSTOMER = { lean: true, ordersLoaded: true, orderCount: 0 };

describe('readLeanSwitch', () => {
  it('is on only for the word true', () => {
    expect(readLeanSwitch('true')).toBe(true);
    expect(readLeanSwitch(' TRUE ')).toBe(true);
    expect(readLeanSwitch('false')).toBe(false);
    expect(readLeanSwitch('1')).toBe(false);
    expect(readLeanSwitch('')).toBe(false);
    expect(readLeanSwitch(undefined)).toBe(false);
  });
});

describe('sectionShown', () => {
  it('leaves out the three sections for a new customer when the switch is on', () => {
    expect(HIDDEN_FOR_NEW_CUSTOMER).toEqual(['need', 'small', 'featured']);
    for (const section of HIDDEN_FOR_NEW_CUSTOMER) {
      expect(sectionShown(section, NEW_CUSTOMER)).toBe(false);
    }
  });

  it('shows everything with the switch off', () => {
    for (const section of HIDDEN_FOR_NEW_CUSTOMER) {
      expect(sectionShown(section, { ...NEW_CUSTOMER, lean: false })).toBe(true);
    }
  });

  it('shows everything once the customer has ordered, even a cancelled order', () => {
    for (const section of HIDDEN_FOR_NEW_CUSTOMER) {
      expect(sectionShown(section, { ...NEW_CUSTOMER, orderCount: 1 })).toBe(true);
    }
  });

  it('hides nothing until the saved orders have been read back', () => {
    for (const section of HIDDEN_FOR_NEW_CUSTOMER) {
      expect(sectionShown(section, { ...NEW_CUSTOMER, ordersLoaded: false })).toBe(true);
    }
  });
});
