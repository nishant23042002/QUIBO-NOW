# 0016. Saved addresses, one chosen address, and the delivery zone check

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-09
- **Source:** the Phase 1 plan for first run and address (1e)

## Context

Home's header, the product page and the cart each showed an address, from different sources. The plan asks for saved addresses
with a landmark and ward, a map pin, and a check that the address is inside what the town delivers to.

## Decision

1. **One chosen address.** The saved addresses and which one the order goes to are one value, kept on the phone and held by
   `AddressProvider`. Everything that shows an address reads it through `useDeliveryAddress`.
2. **Fields.** A name (Home, Work or Other), house or flat, street or area, ward or mohalla, a landmark (optional) and another
   phone number (optional, an Indian mobile number when given), and a pin. Ward and landmark do the real work of finding the door.
3. **Mock map.** Until the real map (Phase 2) the pin is placed on a drawn map of the pilot town with the delivery area shaded.
   The form also has "use the town centre", so a screen reader user never needs the map.
4. **Zone check.** The pin is tested against zone shapes with the ray-casting rule. An address outside every shape cannot be
   saved or chosen, and one that falls outside later (the zones change) is shown as "we do not deliver here yet". The shapes are
   constants for now; they become town data in the database in Phase 2.
5. **Choosing is one tap and goes back**, so the screen that opened the list shows the new address at once. Removing the
   chosen address moves the choice to the first one left.

## Consequences

- The sample address the app used to show is now the first saved address, so a fresh install still has somewhere to deliver.
- Which tab is lit is not decided for the address pages: they are reached from Home and from the cart.
- Real addresses, zones and serviceability come from the API in Phase 2; the shapes of the data here are what its contracts will
  be built from.
