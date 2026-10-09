/** What to do when the shop cannot supply an item: swap it for something similar, leave it out, or ring the customer first. */
export const SUBSTITUTE_CHOICES = ['swap', 'remove', 'call'] as const;
export type SubstituteChoice = (typeof SUBSTITUTE_CHOICES)[number];

export interface Substitution {
  /** What happens to every item that has no choice of its own. */
  fallback: SubstituteChoice;
  /** Choices for particular packs, by pack id. A choice equal to the fallback is never kept here. */
  overrides: Readonly<Record<string, SubstituteChoice>>;
}

export const DEFAULT_SUBSTITUTION: Substitution = { fallback: 'swap', overrides: {} };

const isChoice = (value: unknown): value is SubstituteChoice =>
  typeof value === 'string' && (SUBSTITUTE_CHOICES as readonly string[]).includes(value);

/** What happens to this pack if it cannot be supplied. */
export function choiceOf(substitution: Substitution, packId: string): SubstituteChoice {
  return substitution.overrides[packId] ?? substitution.fallback;
}

/** A new fallback for the order. Choices that now agree with it are no longer exceptions, so they are dropped. */
export function withFallback(substitution: Substitution, fallback: SubstituteChoice): Substitution {
  const overrides = Object.fromEntries(
    Object.entries(substitution.overrides).filter(([, choice]) => choice !== fallback),
  );
  return { fallback, overrides };
}

/** A choice for one pack. Choosing what the order already does for everything else leaves no exception behind. */
export function withOverride(
  substitution: Substitution,
  packId: string,
  choice: SubstituteChoice,
): Substitution {
  const { [packId]: _old, ...rest } = substitution.overrides;
  return {
    fallback: substitution.fallback,
    overrides: choice === substitution.fallback ? rest : { ...rest, [packId]: choice },
  };
}

/** Choices as text for the phone's storage. */
export function serialiseSubstitution(substitution: Substitution): string {
  return JSON.stringify(substitution);
}

/** Choices read back from storage. Anything unreadable is the default, never a crash. */
export function parseSubstitution(saved: string | null): Substitution {
  if (saved === null) return DEFAULT_SUBSTITUTION;
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    if (parsed === null || typeof parsed !== 'object') return DEFAULT_SUBSTITUTION;
    const fallback = isChoice(parsed.fallback) ? parsed.fallback : DEFAULT_SUBSTITUTION.fallback;
    const raw =
      typeof parsed.overrides === 'object' && parsed.overrides !== null
        ? (parsed.overrides as Record<string, unknown>)
        : {};
    const overrides = Object.fromEntries(
      Object.entries(raw).filter(
        (entry): entry is [string, SubstituteChoice] => isChoice(entry[1]) && entry[1] !== fallback,
      ),
    );
    return { fallback, overrides };
  } catch {
    return DEFAULT_SUBSTITUTION;
  }
}
