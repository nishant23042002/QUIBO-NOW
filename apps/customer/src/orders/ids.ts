/**
 * A new random id in the shape of a version 4 UUID. It names an order and keeps a request from being made twice (the idempotency
 * key). The phone's own generator is used when it has one; otherwise random digits fill the same shape. These are mock ids for
 * Phase 1: the server will mint the real ones.
 */
export function newUuid(): string {
  const generator = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (typeof generator?.randomUUID === 'function') return generator.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (placeholder) => {
    const digit = Math.floor(Math.random() * 16);
    // The "y" place holds the variant, whose top bits are 10.
    return (placeholder === 'x' ? digit : (digit & 0x3) | 0x8).toString(16);
  });
}

/** The short number a shopper says on the phone: the last four characters of the order id, for example "#A1B2". */
export function orderNumber(id: string): string {
  return `#${id.replace(/-/g, '').slice(-4).toUpperCase()}`;
}
