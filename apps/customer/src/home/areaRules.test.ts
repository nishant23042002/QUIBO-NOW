import { describe, expect, it } from 'vitest';
import { SEED_ADDRESS, TOWN_CENTRE } from './addresses';
import {
  SERVED_TOWNS,
  addressInArea,
  cleanPincode,
  isPincode,
  pincodeIn,
  pincodeNotifyId,
  townNotifyId,
} from './areaRules';

describe('cleanPincode', () => {
  it('keeps digits only, up to six', () => {
    expect(cleanPincode('4102 03')).toBe('410203');
    expect(cleanPincode('41-02-03-99')).toBe('410203');
    expect(cleanPincode('abc')).toBe('');
  });
});

describe('isPincode', () => {
  it('is six digits that do not start with 0', () => {
    expect(isPincode('410203')).toBe(true);
    expect(isPincode('41020')).toBe(false);
    expect(isPincode('4102030')).toBe(false);
    expect(isPincode('010203')).toBe(false);
    expect(isPincode('41a203')).toBe(false);
  });
});

describe('pincodeIn', () => {
  it('finds a pincode in address text', () => {
    expect(pincodeIn('Station Road, Roha, Raigad 402109')).toBe('402109');
  });

  it('does not take part of a longer number', () => {
    expect(pincodeIn('Plot 12345678')).toBeUndefined();
    expect(pincodeIn('Ward 4')).toBeUndefined();
  });
});

describe('notify ids', () => {
  it('are distinct per pincode and per town', () => {
    expect(pincodeNotifyId('410203')).toBe('pin:410203');
    expect(townNotifyId('mhasla')).toBe('town:mhasla');
  });
});

describe('addressInArea', () => {
  it('is true for the town centre', () => {
    expect(addressInArea({ pin: TOWN_CENTRE })).toBe(true);
    expect(addressInArea(SEED_ADDRESS)).toBe(true);
  });

  it('is false for a pin outside every zone', () => {
    expect(addressInArea({ pin: { lat: 18.41, lng: 73.17 } })).toBe(false);
  });

  it('has nothing to judge without an address or a pin, so it does not block', () => {
    expect(addressInArea(undefined)).toBe(true);
    expect(addressInArea({ pin: null })).toBe(true);
  });
});

describe('SERVED_TOWNS', () => {
  it('lists Roha first, and it is the only live town', () => {
    expect(SERVED_TOWNS[0]?.id).toBe('roha');
    expect(SERVED_TOWNS.filter((town) => town.live).map((town) => town.id)).toEqual(['roha']);
  });
});
