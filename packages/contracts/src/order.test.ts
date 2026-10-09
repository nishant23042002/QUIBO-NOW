import { describe, expect, it } from 'vitest';
import { OrderSchema } from './order';

const base = {
  id: '0192f3c4-7a10-7c3e-8b21-5d6a4e9f0b01',
  townId: '0192f3c4-7a10-7c3e-8b21-5d6a4e9f0a11',
  idempotencyKey: 'key-12345678',
  status: 'accepted',
  acceptance: 'by_shop',
  shops: [{ id: 'dairy', name: 'Sharma Dairy' }],
  payment: { method: 'cod', status: 'to_collect' },
  total: 24900,
  placedAt: '2026-10-09T10:00:00.000Z',
  events: [
    { status: 'placed', at: '2026-10-09T10:00:00.000Z', by: 'customer' },
    { status: 'accepted', at: '2026-10-09T10:00:08.000Z', by: 'shop' },
  ],
};

describe('OrderSchema', () => {
  it('accepts a well-formed order', () => {
    expect(OrderSchema.safeParse(base).success).toBe(true);
  });

  it('needs at least one shop and a placed first event', () => {
    expect(OrderSchema.safeParse({ ...base, shops: [] }).success).toBe(false);
    expect(
      OrderSchema.safeParse({ ...base, status: 'accepted', events: [base.events[1]] }).success,
    ).toBe(false);
  });

  it('needs the status to match the last event', () => {
    expect(OrderSchema.safeParse({ ...base, status: 'ready' }).success).toBe(false);
  });

  it('refuses a move the transition table does not allow', () => {
    const jump = {
      ...base,
      status: 'delivered',
      events: [
        ...base.events,
        { status: 'delivered', at: '2026-10-09T10:05:00.000Z', by: 'rider' },
      ],
    };
    expect(OrderSchema.safeParse(jump).success).toBe(false);
  });

  it('refuses events that go backwards in time', () => {
    const back = {
      ...base,
      events: [base.events[0], { status: 'accepted', at: '2026-10-09T09:59:00.000Z', by: 'shop' }],
    };
    expect(OrderSchema.safeParse(back).success).toBe(false);
  });

  it('keeps money as integer paise', () => {
    expect(OrderSchema.safeParse({ ...base, total: 249.5 }).success).toBe(false);
  });
});
