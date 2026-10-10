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
    items: [
      {
        packId: 'milk:500ml',
        name: 'Toned milk',
        pack: '500 ml',
        emoji: '🥛',
        category: 'dairy',
        quantity: 2,
        lineTotal: 5800,
      },
      {
        packId: 'potato:loose',
        name: 'Potato',
        pack: 'per kg',
        emoji: '🥔',
        category: 'vegetables',
        quantity: 1.5,
        loose: true,
        lineTotal: 7200,
      },
    ],
    address: 'Home - 7B, Market Road',
    delivery: { kind: 'quick', fromMinutes: 25, toMinutes: 30 },
    payment: { method, status: method === 'cod' ? 'to_collect' : 'paid' },
    total: 24900,
    placedAt: at.toISOString(),
    events: [{ status: 'placed', at: at.toISOString(), by: 'customer' }],
  });
}
