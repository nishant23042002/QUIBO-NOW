import { describe, expect, it } from 'vitest';
import {
  EMPTY_DRAFT,
  MOCK_ZONES,
  SEED_ADDRESS,
  SEED_BOOK,
  TOWN_CENTRE,
  addAddress,
  addressDetail,
  formatAddress,
  isServiceable,
  parseBook,
  pointInPolygon,
  removeAddress,
  selectAddress,
  selectedAddress,
  serialiseBook,
  updateAddress,
  validateAddress,
  type AddressDraft,
} from './addresses';

const inside = TOWN_CENTRE;
const outside = { lat: 18.46, lng: 73.165 };

const good: AddressDraft = {
  ...EMPTY_DRAFT,
  house: '7',
  street: 'Market Road',
  ward: 'Ward 2',
  pin: inside,
};

describe('the town zone', () => {
  it('serves the middle of town and not a point outside the shape', () => {
    expect(isServiceable(inside)).toBe(true);
    expect(isServiceable(outside)).toBe(false);
    expect(isServiceable({ lat: 0, lng: 0 })).toBe(false);
  });

  it('works for any shape, here a square', () => {
    const square = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 2 },
      { lat: 2, lng: 2 },
      { lat: 2, lng: 0 },
    ];
    expect(pointInPolygon({ lat: 1, lng: 1 }, square)).toBe(true);
    expect(pointInPolygon({ lat: 3, lng: 1 }, square)).toBe(false);
    expect(isServiceable({ lat: 1, lng: 1 }, [])).toBe(false);
    expect(MOCK_ZONES.length).toBeGreaterThan(0);
  });
});

describe('validateAddress', () => {
  it('has nothing to say about a complete address', () => {
    expect(validateAddress(good)).toEqual({});
  });

  it('asks for the house, street, ward and pin', () => {
    expect(validateAddress(EMPTY_DRAFT)).toEqual({
      house: 'required',
      street: 'required',
      ward: 'required',
      pin: 'required',
    });
  });

  it('treats blanks as empty', () => {
    expect(validateAddress({ ...good, house: '   ' }).house).toBe('required');
  });

  it('does not need a landmark or a second number, but checks a second number that is given', () => {
    expect(validateAddress({ ...good, landmark: '', phone: '' })).toEqual({});
    expect(validateAddress({ ...good, phone: '12345' }).phone).toBe('phone');
    expect(validateAddress({ ...good, phone: '+91 98765 43210' })).toEqual({});
  });

  it('says so when the pin is where we do not deliver', () => {
    expect(validateAddress({ ...good, pin: outside }).pin).toBe('outside');
  });
});

describe('showing an address', () => {
  it('is the house and street after the label, and the ward and landmark as detail', () => {
    expect(formatAddress({ ...good, street: 'Market Road' }, 'Home')).toBe('Home - 7, Market Road');
    expect(addressDetail({ ...good, landmark: 'Near the temple' })).toBe(
      'Ward 2 · Near the temple',
    );
    expect(addressDetail(good)).toBe('Ward 2');
  });
});

describe('the address book', () => {
  it('starts with the sample address chosen', () => {
    expect(selectedAddress(SEED_BOOK)).toBe(SEED_ADDRESS);
  });

  it('makes a new address the one the order goes to', () => {
    const book = addAddress(SEED_BOOK, good, 'a2');
    expect(book.addresses).toHaveLength(2);
    expect(book.selectedId).toBe('a2');
  });

  it('replaces what is saved under an id', () => {
    const book = updateAddress(SEED_BOOK, 'seed', { ...good, house: '99' });
    expect(book.addresses[0]?.house).toBe('99');
    expect(book.addresses[0]?.id).toBe('seed');
  });

  it('moves the choice to the first one left when the chosen one goes, and to none when all have', () => {
    const two = addAddress(SEED_BOOK, good, 'a2');
    expect(removeAddress(two, 'a2').selectedId).toBe('seed');
    expect(removeAddress(removeAddress(two, 'a2'), 'seed')).toEqual({
      addresses: [],
      selectedId: null,
    });
    expect(removeAddress(two, 'seed').selectedId).toBe('a2');
  });

  it('chooses a saved address we deliver to, and nothing else', () => {
    const far = { ...SEED_ADDRESS, id: 'far', pin: outside };
    const book = { addresses: [SEED_ADDRESS, far], selectedId: 'seed' };
    expect(selectAddress(book, 'far')).toBe(book);
    expect(selectAddress(book, 'nope')).toBe(book);
    expect(selectAddress({ ...book, selectedId: null }, 'seed').selectedId).toBe('seed');
  });
});

describe('saving the book', () => {
  it('round-trips', () => {
    const book = addAddress(
      SEED_BOOK,
      { ...good, landmark: 'Near the temple', phone: '9876543210' },
      'a2',
    );
    expect(parseBook(serialiseBook(book))).toEqual(book);
  });

  it('is the sample address when nothing is saved, and when what is saved cannot be read', () => {
    for (const bad of [null, 'nope', '[]', '{"v":9}']) expect(parseBook(bad)).toBe(SEED_BOOK);
  });

  it('skips a damaged address and picks a choice that exists', () => {
    const text = JSON.stringify({
      v: 1,
      addresses: [{ id: 'a', house: 3, street: 'S', pin: { lat: 'x' } }, 'junk', { nope: 1 }],
      selectedId: 'gone',
    });
    const book = parseBook(text);
    expect(book.addresses).toHaveLength(1);
    expect(book.addresses[0]).toMatchObject({
      id: 'a',
      house: '',
      street: 'S',
      pin: null,
      label: 'other',
    });
    expect(book.selectedId).toBe('a');
  });
});
