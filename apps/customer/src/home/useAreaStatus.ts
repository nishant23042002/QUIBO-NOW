import { useSyncExternalStore } from 'react';
import { useAddresses } from './AddressProvider';
import { addressInArea } from './areaRules';

/**
 * Where the shopper is in relation to the delivery area, for this run of the app (ADR 0055, step 10). Nothing here is saved: the
 * address itself says whether it is served, and "Look around Roha anyway" lasts until the app is closed.
 */
interface AreaState {
  /** Development builds only: treat the chosen address as outside the area, to see the screen. */
  forced: boolean;
  /** The address id the shopper chose to look around for. Choosing another address starts the check again. */
  browsingFor: string | null;
}

const listeners = new Set<() => void>();
let current: AreaState = { forced: false, browsingFor: null };

function change(next: Partial<AreaState>): void {
  current = { ...current, ...next };
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const read = (): AreaState => current;

/** The testing switch in Settings (development builds). Switching it also ends any "look around", so the screen shows again. */
export function setForceOutside(forced: boolean): void {
  change({ forced, browsingFor: null });
}

export function useForceOutside(): boolean {
  return useSyncExternalStore(subscribe, read, read).forced;
}

export interface AreaStatus {
  /** The chosen address is somewhere the town does not deliver to. */
  outside: boolean;
  /** The shopper chose to look around anyway, so Home shows the shops with ordering paused. */
  browsing: boolean;
  /** Shows the shops although the address is outside. */
  lookAround: () => void;
  /** Back to the out-of-area screen. */
  backToNotice: () => void;
}

/** Whether Home is the shops or the "we do not deliver here yet" screen, and the two ways between them. */
export function useAreaStatus(): AreaStatus {
  const { selected } = useAddresses();
  const state = useSyncExternalStore(subscribe, read, read);
  const outside = state.forced || !addressInArea(selected);
  const key = selected?.id ?? '';
  return {
    outside,
    browsing: outside && state.browsingFor === key,
    lookAround: () => {
      change({ browsingFor: key });
    },
    backToNotice: () => {
      change({ browsingFor: null });
    },
  };
}
