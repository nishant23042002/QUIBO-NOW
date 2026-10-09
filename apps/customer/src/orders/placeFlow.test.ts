import { describe, expect, it } from 'vitest';
import { IDLE, isBusy, nextFlow, type FlowEvent, type FlowState } from './placeFlow';

const run = (events: FlowEvent[], from: FlowState = IDLE): FlowState =>
  events.reduce(nextFlow, from);

describe('placing with cash', () => {
  it('goes straight to placing, then placed', () => {
    expect(run([{ type: 'place', method: 'cod' }]).step).toBe('placing');
    expect(run([{ type: 'place', method: 'cod' }, { type: 'saved' }]).step).toBe('placed');
  });

  it('ignores a second tap while it is being placed', () => {
    const placing = run([{ type: 'place', method: 'cod' }]);
    expect(nextFlow(placing, { type: 'place', method: 'cod' })).toBe(placing);
    expect(nextFlow(placing, { type: 'place', method: 'upi' })).toBe(placing);
  });
});

describe('placing with UPI', () => {
  it('opens the sheet first', () => {
    expect(run([{ type: 'place', method: 'upi' }]).step).toBe('sheet');
  });

  it('pays, then places the order', () => {
    const paying = run([{ type: 'place', method: 'upi' }, { type: 'pay' }]);
    expect(paying).toEqual({ step: 'paying', outcome: 'ok' });
    expect(nextFlow(paying, { type: 'settled' }).step).toBe('placing');
  });

  it('can fail, stays open with the cart untouched, and can be tried again', () => {
    const failed = run([
      { type: 'place', method: 'upi' },
      { type: 'decline' },
      { type: 'settled' },
    ]);
    expect(failed.step).toBe('failed');
    expect(run([{ type: 'pay' }, { type: 'settled' }], failed).step).toBe('placing');
  });

  it('can be closed from the sheet and after a failure, but not while paying', () => {
    expect(run([{ type: 'place', method: 'upi' }, { type: 'close' }])).toBe(IDLE);
    const failed = run([
      { type: 'place', method: 'upi' },
      { type: 'decline' },
      { type: 'settled' },
    ]);
    expect(nextFlow(failed, { type: 'close' })).toBe(IDLE);
    const paying = run([{ type: 'place', method: 'upi' }, { type: 'pay' }]);
    expect(nextFlow(paying, { type: 'close' })).toBe(paying);
  });

  it('cannot pay twice at once', () => {
    const paying = run([{ type: 'place', method: 'upi' }, { type: 'pay' }]);
    expect(nextFlow(paying, { type: 'pay' })).toBe(paying);
    expect(nextFlow(paying, { type: 'decline' })).toBe(paying);
  });
});

describe('out-of-order events', () => {
  it('change nothing', () => {
    expect(nextFlow(IDLE, { type: 'settled' })).toBe(IDLE);
    expect(nextFlow(IDLE, { type: 'saved' })).toBe(IDLE);
    expect(nextFlow(IDLE, { type: 'pay' })).toBe(IDLE);
  });
});

describe('isBusy', () => {
  it('is true while a payment or an order is being worked on', () => {
    expect(isBusy(IDLE)).toBe(false);
    expect(isBusy(run([{ type: 'place', method: 'upi' }]))).toBe(false);
    expect(isBusy(run([{ type: 'place', method: 'upi' }, { type: 'pay' }]))).toBe(true);
    expect(isBusy(run([{ type: 'place', method: 'cod' }]))).toBe(true);
    expect(isBusy(run([{ type: 'place', method: 'cod' }, { type: 'saved' }]))).toBe(true);
  });
});
