/** The chips of the strip at the top of Home, in order (ADR 0055, step 2; the offers joined it after step 11). */
export type StripChipId = 'cod' | 'free' | 'code' | 'quiet';

/**
 * Which chips show. "Pay on delivery" only shows where cash on delivery is allowed (the town's rule, ADR 0019): a promise on the
 * first screen must be one checkout keeps. After it come the best offers, at most three: free delivery from the town's line, the
 * best coupon (when the app has one that takes something off), and quieter delivery windows (when one saves something).
 */
export function stripChips(rules: {
  codMax: number;
  hasCoupon: boolean;
  hasSaving: boolean;
}): readonly StripChipId[] {
  return [
    ...(rules.codMax > 0 ? (['cod'] as const) : []),
    'free',
    ...(rules.hasCoupon ? (['code'] as const) : []),
    ...(rules.hasSaving ? (['quiet'] as const) : []),
  ];
}
