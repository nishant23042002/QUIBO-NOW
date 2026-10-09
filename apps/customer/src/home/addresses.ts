import { isMobile } from './phone';

/** A place on the map. Until the real map arrives (Phase 2) the picker is a drawn one, over the same kind of numbers. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** The part of the world the mock map shows: the pilot town and a little around it. */
export const MAP_BOUNDS = { north: 18.47, south: 18.4, west: 73.07, east: 73.17 } as const;

/**
 * Where the pilot town delivers, as shapes on the map. An address with its pin outside every shape is not served yet. These
 * are stand-ins for the zone polygons the shops' town will have in the database (zones live in the database, not in code,
 * once there is one).
 */
export const MOCK_ZONES: readonly (readonly LatLng[])[] = [
  [
    { lat: 18.415, lng: 73.095 },
    { lat: 18.415, lng: 73.145 },
    { lat: 18.44, lng: 73.155 },
    { lat: 18.455, lng: 73.13 },
    { lat: 18.45, lng: 73.1 },
    { lat: 18.43, lng: 73.088 },
  ],
];

/** The middle of the town: where the picker starts and what "use the town centre" sets. */
export const TOWN_CENTRE: LatLng = { lat: 18.432, lng: 73.12 };

/** Whether a point is inside a shape (the ray-casting rule: a line out to the side crosses an odd number of edges). */
export function pointInPolygon(point: LatLng, polygon: readonly LatLng[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (a === undefined || b === undefined) continue;
    const crosses =
      a.lat > point.lat !== b.lat > point.lat &&
      point.lng < ((b.lng - a.lng) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lng;
    if (crosses) inside = !inside;
  }
  return inside;
}

/** Whether we deliver to this place. */
export function isServiceable(
  point: LatLng,
  zones: readonly (readonly LatLng[])[] = MOCK_ZONES,
): boolean {
  return zones.some((zone) => pointInPolygon(point, zone));
}

export const ADDRESS_LABELS = ['home', 'work', 'other'] as const;
export type AddressLabel = (typeof ADDRESS_LABELS)[number];

/** What is typed into the address form. */
export interface AddressDraft {
  label: AddressLabel;
  /** House or flat. */
  house: string;
  /** Street or area. */
  street: string;
  /** For the rider to find it by: "near the temple". Not required. */
  landmark: string;
  /** Ward or mohalla. */
  ward: string;
  /** Another number to reach someone at this address. Not required. */
  phone: string;
  pin: LatLng | null;
}

export interface SavedAddress extends AddressDraft {
  id: string;
}

export const EMPTY_DRAFT: AddressDraft = {
  label: 'home',
  house: '',
  street: '',
  landmark: '',
  ward: '',
  phone: '',
  pin: null,
};

export type AddressField = 'house' | 'street' | 'ward' | 'phone' | 'pin';
/** What is wrong with a field: it is empty, it is not a mobile number, or the pin is somewhere we do not deliver. */
export type AddressProblem = 'required' | 'phone' | 'outside';

/** What is wrong with a draft, by field. Nothing in the result means it can be saved. */
export function validateAddress(
  draft: AddressDraft,
  zones: readonly (readonly LatLng[])[] = MOCK_ZONES,
): Partial<Record<AddressField, AddressProblem>> {
  const problems: Partial<Record<AddressField, AddressProblem>> = {};
  if (draft.house.trim() === '') problems.house = 'required';
  if (draft.street.trim() === '') problems.street = 'required';
  if (draft.ward.trim() === '') problems.ward = 'required';
  if (draft.phone.trim() !== '' && !isMobile(draft.phone)) problems.phone = 'phone';
  if (draft.pin === null) problems.pin = 'required';
  else if (!isServiceable(draft.pin, zones)) problems.pin = 'outside';
  return problems;
}

/** The address on one line, for a header or a bar: "Home - 12, Station Road". */
export function formatAddress(address: AddressDraft, labelText: string): string {
  const place = [address.house.trim(), address.street.trim()]
    .filter((part) => part !== '')
    .join(', ');
  return `${labelText} - ${place}`;
}

/** The rest of it, for a card: the ward and the landmark. */
export function addressDetail(address: AddressDraft): string {
  return [address.ward.trim(), address.landmark.trim()].filter((part) => part !== '').join(' · ');
}

// ---- The saved addresses, and which one the order goes to.

export interface AddressBook {
  addresses: readonly SavedAddress[];
  /** The one the order is delivered to. Null when there are none. */
  selectedId: string | null;
}

/** The sample address the app starts with, until the shopper adds their own (the one the screens used to show). */
export const SEED_ADDRESS: SavedAddress = {
  id: 'seed',
  label: 'home',
  house: '12',
  street: 'Station Road, Roha, Raigad 402109',
  landmark: 'Near the bus stand',
  ward: 'Ward 4',
  phone: '',
  pin: { lat: 18.432, lng: 73.12 },
};

export const SEED_BOOK: AddressBook = { addresses: [SEED_ADDRESS], selectedId: SEED_ADDRESS.id };

/** The address the order goes to, if there is one. */
export function selectedAddress(book: AddressBook): SavedAddress | undefined {
  return book.addresses.find((address) => address.id === book.selectedId);
}

/** Adds an address and makes it the one the order goes to: it was just entered for that. */
export function addAddress(book: AddressBook, draft: AddressDraft, id: string): AddressBook {
  return { addresses: [...book.addresses, { ...draft, id }], selectedId: id };
}

/** Replaces what is saved under an id. */
export function updateAddress(book: AddressBook, id: string, draft: AddressDraft): AddressBook {
  return {
    ...book,
    addresses: book.addresses.map((address) => (address.id === id ? { ...draft, id } : address)),
  };
}

/** Takes an address away. If it was the one the order goes to, the first one left is, or none. */
export function removeAddress(book: AddressBook, id: string): AddressBook {
  const addresses = book.addresses.filter((address) => address.id !== id);
  const selectedId = book.selectedId === id ? (addresses[0]?.id ?? null) : book.selectedId;
  return { addresses, selectedId };
}

/**
 * Chooses where the order goes. An address we do not deliver to cannot be chosen, and neither can one that is not saved;
 * the book comes back unchanged.
 */
export function selectAddress(
  book: AddressBook,
  id: string,
  zones: readonly (readonly LatLng[])[] = MOCK_ZONES,
): AddressBook {
  const found = book.addresses.find((address) => address.id === id);
  if (found === undefined || found.pin === null || !isServiceable(found.pin, zones)) return book;
  return { ...book, selectedId: id };
}

const VERSION = 1;

export function serialiseBook(book: AddressBook): string {
  return JSON.stringify({ v: VERSION, ...book });
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

function parseAddress(raw: unknown): SavedAddress | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || r.id === '') return undefined;
  const label = ADDRESS_LABELS.find((candidate) => candidate === r.label) ?? 'other';
  const pin = r.pin as Record<string, unknown> | null | undefined;
  const hasPin =
    pin !== null &&
    typeof pin === 'object' &&
    typeof pin.lat === 'number' &&
    typeof pin.lng === 'number';
  return {
    id: r.id,
    label,
    house: text(r.house),
    street: text(r.street),
    landmark: text(r.landmark),
    ward: text(r.ward),
    phone: text(r.phone),
    pin: hasPin ? { lat: pin.lat as number, lng: pin.lng as number } : null,
  };
}

/** Saved addresses read back from the phone. Nothing saved is the sample address; something unreadable is never a crash. */
export function parseBook(saved: string | null): AddressBook {
  if (saved === null) return SEED_BOOK;
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    if (parsed === null || typeof parsed !== 'object' || parsed.v !== VERSION) return SEED_BOOK;
    const list = Array.isArray(parsed.addresses) ? (parsed.addresses as unknown[]) : [];
    const addresses = list.flatMap((item) => {
      const address = parseAddress(item);
      return address === undefined ? [] : [address];
    });
    const wanted = typeof parsed.selectedId === 'string' ? parsed.selectedId : null;
    const selectedId = addresses.some((address) => address.id === wanted)
      ? wanted
      : (addresses[0]?.id ?? null);
    return { addresses, selectedId };
  } catch {
    return SEED_BOOK;
  }
}
