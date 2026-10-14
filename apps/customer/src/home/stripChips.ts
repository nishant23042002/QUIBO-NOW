/** The chips of the strip under Home's mosaic, in order (ADR 0055, step 2). */
export type StripChipId = 'cod' | 'visited' | 'free' | 'upi';

/**
 * Which chips show. "Pay on delivery" only shows where cash on delivery is allowed (the town's rule, ADR 0019): a promise on the
 * first screen must be one checkout keeps. The others are always true of the app: shops are visited before they are listed
 * (ADR 0054), delivery is free from the town's line, and UPI is a payment choice.
 */
export function stripChips(rules: { codMax: number }): readonly StripChipId[] {
  return [...(rules.codMax > 0 ? (['cod'] as const) : []), 'visited', 'free', 'upi'];
}
