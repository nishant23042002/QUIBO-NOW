import { useCallback, useEffect, useRef, useState } from 'react';
import { readSetting, writeSetting } from '@/storage';
import { parseChoice, resolveChoice, serialiseChoice, type Slot, type SlotChoice } from './slots';

/** Where the phone keeps the chosen delivery time, so it is still there after the app is closed. */
const SLOT_KEY = 'quibo.slot';
/** How often the clock is looked at again, so windows that have gone stop being offered. */
const TICK_MS = 60_000;

export interface SlotState {
  /** The time it is now, refreshed every minute. */
  now: Date;
  /** What the shopper picked: the earliest window, or one particular one. */
  choice: SlotChoice;
  setChoice: (next: SlotChoice) => void;
  /** The window that choice means right now. A particular window that has gone falls back to the earliest. */
  slot: Slot | undefined;
  /** Whether `slot` is the earliest window (chosen so, or fallen back to). */
  earliest: boolean;
}

/**
 * The delivery time for the order: the shopper's choice, kept on the phone, and the window it means at this moment.
 * The earliest window moves on as the day goes by; a particular window stays until it has passed or filled up.
 */
export function useSlotChoice(): SlotState {
  const [now, setNow] = useState(() => new Date());
  const [choice, setChoiceState] = useState<SlotChoice>({ mode: 'earliest' });
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

  const { slot, earliest } = resolveChoice(choice, now);
  return { now, choice, setChoice, slot, earliest };
}
