import { useCallback, useEffect, useRef, useState } from 'react';
import { readSetting, writeSetting } from '@/storage';
import {
  parseChoice,
  quickAvailable,
  resolveChoice,
  serialiseChoice,
  deliveryNote,
  type Delivery,
  type DeliveryNote,
  type SlotChoice,
} from './slots';

/** Where the phone keeps the chosen delivery time, so it is still there after the app is closed. */
const SLOT_KEY = 'quibo.slot';
/** How often the clock is looked at again, so windows that have gone stop being offered. */
const TICK_MS = 60_000;

export interface SlotState {
  /** The time it is now, refreshed every minute. */
  now: Date;
  /** What the shopper picked: quick delivery, or one particular window. */
  choice: SlotChoice;
  setChoice: (next: SlotChoice) => void;
  /** How the order will be delivered right now. A particular window that has gone falls back to quick delivery. */
  current: Delivery | undefined;
  /** Whether quick delivery is running now (it is not late at night). */
  quickOpen: boolean;
  /** Set when the order is not delivered the way the shopper chose (their window passed, or quick delivery has closed). */
  note: DeliveryNote | undefined;
  /** Accepts a change the shopper did not make: their old window is forgotten, and the order follows quick delivery. */
  dismissNote: () => void;
}

/**
 * The delivery time for the order: the shopper's choice, kept on the phone, and how it will be delivered at this moment.
 * Quick delivery is the default; a particular window stays until it has passed or filled up.
 */
export function useSlotChoice(): SlotState {
  const [now, setNow] = useState(() => new Date());
  const [choice, setChoiceState] = useState<SlotChoice>({ mode: 'quick' });
  // A choice made before the saved one has been read back must not be written over by it.
  const touched = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, TICK_MS);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let live = true;
    void readSetting(SLOT_KEY).then((saved) => {
      if (live && !touched.current) setChoiceState(parseChoice(saved));
    });
    return () => {
      live = false;
    };
  }, []);

  const setChoice = useCallback((next: SlotChoice) => {
    touched.current = true;
    setChoiceState(next);
    void writeSetting(SLOT_KEY, serialiseChoice(next));
  }, []);

  const current = resolveChoice(choice, now);
  return {
    now,
    choice,
    setChoice,
    current,
    quickOpen: quickAvailable(now),
    note: deliveryNote(choice, current),
    dismissNote: () => {
      setChoice({ mode: 'quick' });
    },
  };
}
