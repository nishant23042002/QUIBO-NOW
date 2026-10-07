import { z } from 'zod';
import { FulfilmentModeSchema } from './fulfilment';
import { TownIdSchema } from './ids';

/** Lifecycle of a town. STUB: mirrors the store status in PLAN section 10. */
export const TOWN_STATUSES = ['onboarding', 'active', 'paused'] as const;
export const TownStatusSchema = z.enum(TOWN_STATUSES);
export type TownStatus = z.infer<typeof TownStatusSchema>;

/**
 * A town, the tenant. Only the fields Phase 0 fixtures need; the full `town` entity
 * (settings, zones) arrives with the data model in Phase 2.
 */
export const TownSchema = z.object({
  id: TownIdSchema,
  name: z.string().min(1),
  state: z.string().min(1),
  status: TownStatusSchema,
  fulfilmentMode: FulfilmentModeSchema,
});
export type Town = z.infer<typeof TownSchema>;
