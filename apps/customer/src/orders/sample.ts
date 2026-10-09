import { OrderSchema, type Acceptance, type Order } from '@quibo/contracts';

/** A placed order for tests and previews: two shops, cash on delivery, placed at `at`. */
export function samplePlacedOrder(
  acceptance: Acceptance = 'by_shop',
  at: Date = new Date('2026-10-09T10:00:00.000Z'),
  method: 'cod' | 'upi' = 'cod',
): Order {
  return OrderSchema.parse({
    id: '0192f3c4-7a10-7c3e-8b21-5d6a4e9f0b01',
    townId: '0192f3c4-7a10-7c3e-8b21-5d6a4e9f0a11',
    idempotencyKey: 'key-12345678',
    status: 'placed',
    acceptance,
    shops: [
      { id: 'dairy', name: 'Sharma Dairy' },
      { id: 'veg', name: 'Gupta Vegetables' },
    ],
    payment: { method, status: method === 'cod' ? 'to_collect' : 'paid' },
    total: 24900,
    placedAt: at.toISOString(),
    events: [{ status: 'placed', at: at.toISOString(), by: 'customer' }],
  });
}
