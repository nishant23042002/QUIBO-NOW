/** The quick choices for the rider, in the order they are shown. */
export const INSTRUCTIONS = ['security', 'leaveAtDoor', 'noBell', 'callOnArrival', 'pets'] as const;
export type InstructionKey = (typeof INSTRUCTIONS)[number];

/** The longest note for the rider, in characters. */
export const NOTE_MAX = 120;

export interface Instructions {
  /** The chosen quick choices, always in the order of `INSTRUCTIONS`. */
  chips: readonly InstructionKey[];
  note: string;
}

export const NO_INSTRUCTIONS: Instructions = { chips: [], note: '' };

/** A choice turned on if it was off, and off if it was on, keeping the list in its usual order. */
export function toggleInstruction(
  chips: readonly InstructionKey[],
  key: InstructionKey,
): InstructionKey[] {
  const next = chips.includes(key) ? chips.filter((chip) => chip !== key) : [...chips, key];
  return INSTRUCTIONS.filter((candidate) => next.includes(candidate));
}

/** A note cut to the longest allowed. Nothing else is changed, so typing never fights the shopper. */
export function clampNote(text: string): string {
  return text.slice(0, NOTE_MAX);
}

/** Instructions as text for the phone's storage. */
export function serialiseInstructions(value: Instructions): string {
  return JSON.stringify(value);
}

/** Instructions read back from storage. Anything unreadable is no instructions, never a crash. */
export function parseInstructions(saved: string | null): Instructions {
  if (saved === null) return NO_INSTRUCTIONS;
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    if (parsed === null || typeof parsed !== 'object') return NO_INSTRUCTIONS;
    const chips = Array.isArray(parsed.chips)
      ? INSTRUCTIONS.filter((key) => (parsed.chips as unknown[]).includes(key))
      : [];
    const note = typeof parsed.note === 'string' ? clampNote(parsed.note) : '';
    return { chips, note };
  } catch {
    return NO_INSTRUCTIONS;
  }
}
