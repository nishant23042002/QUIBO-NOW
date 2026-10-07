import { z } from 'zod';

/**
 * Identifies a town (the tenant). Every business table carries one. A UUID string,
 * branded so a plain string or another id type cannot be passed by mistake.
 */
export const TownIdSchema = z.uuid().brand<'TownId'>();
export type TownId = z.infer<typeof TownIdSchema>;
