# 0020. The phone's connection state comes from netinfo

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-10
- **Source:** the owner's approval during Phase 1 hardening (1h)

## Context

The app has offline screens, and ordering needs a connection. React Native has no built-in way to ask whether the phone is
online, so until now a phone always counted as online and only a testing switch could show the offline states. That left the
offline and throttled-network checks of the Phase 1 gate without a real signal on a real phone. PHASE-1.md asked to add
`@react-native-community/netinfo` only if it turned out to be necessary, and to ask again at that point.

## Decision

1. **Add `@react-native-community/netinfo`** (version 12.0.1, the one Expo SDK 57 pins), and read the phone's connection through
   it. On the web the browser's own online and offline events are still used.
2. **Benefit of the doubt.** The phone is treated as offline only when it says so (not connected, or connected to something that
   reaches no internet). While it is still working that out, the app behaves as online, and a request that fails says so itself.
3. **The testing switches stay.** "Pretend offline" and "make the next load fail" work as before, and combine with the real signal.
4. **No behaviour changes elsewhere.** Every screen already reads `useOnline()`; only where that value comes from changes.

## Consequences

- One more native module, about 100 KB. It is part of Expo's pinned set, so it is upgraded with the SDK (ADR 0003).
- The offline states can be seen on a real phone by turning on airplane mode, and a throttled network can be told from a dead one.
- The mock API has no real requests yet, so a captive portal (connected, but nothing reaches the internet) shows as offline only if
  the phone's own check detects it. Phase 2's requests add their own failure handling.
