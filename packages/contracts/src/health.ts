import { z } from 'zod';

/** Response of GET /health. The mock API and the real API both return exactly this. */
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
