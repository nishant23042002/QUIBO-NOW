import { useCallback, useEffect, useRef, useState } from 'react';
import { readSetting, writeSetting } from '@/storage';
import {
  NO_INSTRUCTIONS,
  clampNote,
  parseInstructions,
  serialiseInstructions,
  toggleInstruction,
  type InstructionKey,
  type Instructions,
} from './instructions';

/** Where the phone keeps the instructions for the rider, so a shopper does not have to say "beware of the dog" every time. */
const INSTRUCTIONS_KEY = 'quibo.instructions';

export interface InstructionsState extends Instructions {
  /** False until the saved instructions have been read back, so the cart does not first show none and then jump. */
  loaded: boolean;
  toggle: (key: InstructionKey) => void;
  setNote: (text: string) => void;
}

/** The instructions for the rider (quick choices and a note), kept on the phone. */
export function useInstructions(): InstructionsState {
  const [value, setValue] = useState<Instructions>(NO_INSTRUCTIONS);
  const [loaded, setLoaded] = useState(false);
  // A change made before the saved instructions have been read back must not be written over by them.
  const touched = useRef(false);

  useEffect(() => {
    let live = true;
    void readSetting(INSTRUCTIONS_KEY).then((saved) => {
      if (!live) return;
      if (!touched.current) setValue(parseInstructions(saved));
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void writeSetting(INSTRUCTIONS_KEY, serialiseInstructions(value));
  }, [loaded, value]);

  const toggle = useCallback((key: InstructionKey) => {
    touched.current = true;
    setValue((current) => ({ ...current, chips: toggleInstruction(current.chips, key) }));
  }, []);

  const setNote = useCallback((text: string) => {
    touched.current = true;
    setValue((current) => ({ ...current, note: clampNote(text) }));
  }, []);

  return { ...value, loaded, toggle, setNote };
}
