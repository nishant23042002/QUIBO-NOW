import { useCallback, useEffect, useRef, useState } from 'react';
import { readSetting, writeSetting } from '@/storage';
import {
  DEFAULT_SUBSTITUTION,
  choiceOf,
  parseSubstitution,
  serialiseSubstitution,
  withFallback,
  withOverride,
  type SubstituteChoice,
  type Substitution,
} from './substitution';

/** Where the phone keeps what to do when an item is unavailable, so the shopper chooses once, not on every order. */
const SUBSTITUTION_KEY = 'quibo.substitution';

export interface SubstitutionState extends Substitution {
  /** False until the saved choice has been read back, so the card does not show the default and then jump. */
  loaded: boolean;
  /** What happens to this pack if it cannot be supplied. */
  choiceFor: (packId: string) => SubstituteChoice;
  /** Sets what happens to every item that has no choice of its own. */
  setFallback: (choice: SubstituteChoice) => void;
  /** Sets what happens to one pack. */
  setFor: (packId: string, choice: SubstituteChoice) => void;
  /** Takes back every choice made for a single item, leaving the one for the whole order. */
  clearOverrides: () => void;
}

/** What to do when an item is unavailable: one choice for the order, and a choice of its own for any item, kept on the phone. */
export function useSubstitution(): SubstitutionState {
  const [value, setValue] = useState<Substitution>(DEFAULT_SUBSTITUTION);
  const [loaded, setLoaded] = useState(false);
  // A change made before the saved choice has been read back must not be written over by it.
  const touched = useRef(false);

  useEffect(() => {
    let live = true;
    void readSetting(SUBSTITUTION_KEY).then((saved) => {
      if (!live) return;
      if (!touched.current) setValue(parseSubstitution(saved));
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void writeSetting(SUBSTITUTION_KEY, serialiseSubstitution(value));
  }, [loaded, value]);

  const choiceFor = useCallback((packId: string) => choiceOf(value, packId), [value]);

  const setFallback = useCallback((choice: SubstituteChoice) => {
    touched.current = true;
    setValue((current) => withFallback(current, choice));
  }, []);

  const setFor = useCallback((packId: string, choice: SubstituteChoice) => {
    touched.current = true;
    setValue((current) => withOverride(current, packId, choice));
  }, []);

  const clearOverrides = useCallback(() => {
    setValue((current) =>
      Object.keys(current.overrides).length === 0 ? current : { ...current, overrides: {} },
    );
  }, []);

  return { ...value, loaded, choiceFor, setFallback, setFor, clearOverrides };
}
