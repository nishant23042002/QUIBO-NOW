import { TownSchema, type Town } from '@quibo/contracts';

// Generic on purpose: the pilot town is not chosen yet (PLAN section 1), so no real place is named.
// Parsing through TownSchema makes a fixture that drifts from the contract fail on import.

/** A town supplied by partner shops: Home lists shops, availability is a toggle. */
export const partnerTown: Town = TownSchema.parse({
  id: '0192f3c4-7a10-7c3e-8b21-5d6a4e9f0a11',
  name: 'Demo Town (partner mode)',
  state: 'Demo State',
  status: 'active',
  fulfilmentMode: 'partner',
});

/** A town supplied by one company dark store: Home opens straight into that store, stock is counted. */
export const darkTown: Town = TownSchema.parse({
  id: '0192f3c4-7a10-7c3e-8b21-5d6a4e9f0a22',
  name: 'Demo Town (dark-store mode)',
  state: 'Demo State',
  status: 'active',
  fulfilmentMode: 'dark',
});

export const towns = { partner: partnerTown, dark: darkTown } as const;
