import type { PaymentMethod } from '@quibo/contracts';

/**
 * Where "Place order" is. Cash goes straight to placing. UPI opens the test payment sheet first; the shopper pays or makes it
 * fail, a failed payment leaves the sheet open with a message, and a successful one moves on to placing.
 */
export interface FlowState {
  step: 'idle' | 'sheet' | 'paying' | 'failed' | 'placing' | 'placed';
  /** While `paying`: how the test payment will end. */
  outcome: 'ok' | 'fail';
}

export const IDLE: FlowState = { step: 'idle', outcome: 'ok' };

export type FlowEvent =
  | { type: 'place'; method: PaymentMethod }
  /** The sheet's Pay button. */
  | { type: 'pay' }
  /** The sheet's "make this payment fail" button. */
  | { type: 'decline' }
  /** The pause of paying is over. */
  | { type: 'settled' }
  /** The order has been saved. */
  | { type: 'saved' }
  /** The shopper closed the sheet. */
  | { type: 'close' };

/** The next state. A press that does not apply in the current step (a second tap, say) changes nothing. */
export function nextFlow(state: FlowState, event: FlowEvent): FlowState {
  switch (event.type) {
    case 'place':
      return state.step === 'idle'
        ? { ...state, step: event.method === 'cod' ? 'placing' : 'sheet' }
        : state;
    case 'pay':
      return state.step === 'sheet' || state.step === 'failed'
        ? { step: 'paying', outcome: 'ok' }
        : state;
    case 'decline':
      return state.step === 'sheet' || state.step === 'failed'
        ? { step: 'paying', outcome: 'fail' }
        : state;
    case 'settled':
      return state.step === 'paying'
        ? { ...state, step: state.outcome === 'ok' ? 'placing' : 'failed' }
        : state;
    case 'saved':
      return state.step === 'placing' ? { ...state, step: 'placed' } : state;
    case 'close':
      return state.step === 'sheet' || state.step === 'failed' ? IDLE : state;
  }
}

/** Whether the shopper has to wait: a payment or an order is being worked on. */
export function isBusy(state: FlowState): boolean {
  return state.step === 'paying' || state.step === 'placing' || state.step === 'placed';
}
