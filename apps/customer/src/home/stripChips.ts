/** The chips of the strip under Home's mosaic, in order (ADR 0055, step 2). */
export type StripChipId = 'cod' | 'visited' | 'free' | 'upi';

/**
 * Which chips show. "Pay on delivery" only shows where cash on delivery is allowed (the town's rule, ADR 0019): a promise on the
 * first screen must be one checkout keeps. "Visited shops only" only shows where the town is served by partner shops: a company
 * dark store is not a shop that was visited and listed (ADR 0054). The others are always true of the app: delivery is free from
 * the town's line, and UPI is a payment choice.
 */
export function stripChips(rules: {
  codMax: number;
  store: 'partner' | 'dark';
}): readonly StripChipId[] {
  return [
    ...(rules.codMax > 0 ? (['cod'] as const) : []),
    ...(rules.store === 'partner' ? (['visited'] as const) : []),
    'free',
    'upi',
  ];
}
