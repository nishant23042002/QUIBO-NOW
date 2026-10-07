import { z } from 'zod';

/**
 * How a town is supplied. Town configuration, switchable at any time. Order, payment,
 * dispatch and ledger code never branch on it; differences live behind the
 * FulfilmentStrategy interface (availability, accept, pick, settle).
 */
export const FULFILMENT_MODES = ['partner', 'dark', 'hybrid'] as const;
export const FulfilmentModeSchema = z.enum(FULFILMENT_MODES);
export type FulfilmentMode = z.infer<typeof FulfilmentModeSchema>;

/** How a store tracks availability: a shop toggle, or counted stock from stock movements. */
export const STOCK_MODES = ['toggle', 'counted'] as const;
export const StockModeSchema = z.enum(STOCK_MODES);
export type StockMode = z.infer<typeof StockModeSchema>;

/** Who runs the store: a partner shop, or the company's own dark store. */
export const STORE_TYPES = ['partner', 'dark'] as const;
export const StoreTypeSchema = z.enum(STORE_TYPES);
export type StoreType = z.infer<typeof StoreTypeSchema>;
