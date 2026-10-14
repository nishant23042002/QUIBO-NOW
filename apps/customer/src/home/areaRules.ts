import { isServiceable, type LatLng, type SavedAddress } from './addresses';

/**
 * The rules behind "Out of the area" (ADR 0055, step 10): whether the chosen address is one the town delivers to, what a pincode
 * is, and which towns Quibo is in or is signing shops up in. The towns are stand-ins for town data from the API in Phase 2.
 */

/** A pincode in India is six digits and does not start with 0. */
export const PINCODE_LENGTH = 6;

/** What is typed, kept to digits and to the length of a pincode. */
export function cleanPincode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, PINCODE_LENGTH);
}

export function isPincode(value: string): boolean {
  return /^[1-9]\d{5}$/.test(value);
}

/** A pincode written in a piece of address text ("Station Road, Roha, Raigad 402109"), if there is one. */
export function pincodeIn(text: string): string | undefined {
  return /(?<!\d)[1-9]\d{5}(?!\d)/.exec(text)?.[0];
}

/** What the Notify me store keeps for a pincode and for a town. Both sit beside the categories' ids in the same list. */
export const pincodeNotifyId = (pincode: string): string => `pin:${pincode}`;
export const townNotifyId = (townId: string): string => `town:${townId}`;

/**
 * Whether the order can be delivered to this address. No address, or one with no pin, is not "outside": there is nothing to judge, and
 * the address screens already ask for one. Only a pin that falls outside every zone is out of the area.
 */
export function addressInArea(
  address: Pick<SavedAddress, 'pin'> | undefined,
  zones?: readonly (readonly LatLng[])[],
): boolean {
  if (address === undefined || address.pin === null) return true;
  return isServiceable(address.pin, zones);
}

export interface ServedTown {
  id: 'roha' | 'mhasla' | 'tala';
  /** Quibo has shops here today. The others are signing shops up. */
  live: boolean;
  /** The picture on the town's tile: an emoji, written as an escape so it survives any editor. */
  emoji: string;
  /** The tile's colour, as a theme token. */
  tint: 'accentSubtle' | 'tintStaples' | 'tintVegetables';
}

/** Where Quibo is today and where it is signing shops up, Roha first. */
export const SERVED_TOWNS: readonly ServedTown[] = [
  { id: 'roha', live: true, emoji: '\u{1F95B}', tint: 'accentSubtle' },
  { id: 'mhasla', live: false, emoji: '\u{1F33E}', tint: 'tintStaples' },
  { id: 'tala', live: false, emoji: '\u{1F966}', tint: 'tintVegetables' },
];
