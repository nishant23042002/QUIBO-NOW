/**
 * The moment screens (ADR 0055, step 11): short full-screen beats that say one true thing about how Quibo works. This file holds the
 * rules for when they may appear and the facts they carry, so they are tested without a screen.
 */

/** The facts, in the order they come round. The words are messages (`moment.fact.<id>`); `emoji` is its picture. */
export const MOMENT_FACTS = [
  { id: 'shop', emoji: '\u{1F3EA}' },
  { id: 'visit', emoji: '\u{1F6AA}' },
  { id: 'name', emoji: '\u{1F3F7}\u{FE0F}' },
  { id: 'plan', emoji: '\u{1F91D}' },
  { id: 'check', emoji: '\u{1F9FD}' },
  { id: 'price', emoji: '\u{1F4B8}' },
] as const;

/** The fact for a position in the round, wrapping round. */
export function momentFact(index: number): (typeof MOMENT_FACTS)[number] {
  const size = MOMENT_FACTS.length;
  const fact = MOMENT_FACTS[((index % size) + size) % size];
  // The list is never empty, so this only satisfies the compiler.
  return fact ?? MOMENT_FACTS[0];
}

/** How long a fact stays before it closes by itself. A tap closes it at once. */
export const FACT_MS = 1500;

/** A moment never follows another one within this time, so the app never feels like a series of interruptions. */
export const MOMENT_GAP_MS = 20_000;

/**
 * Screens that are a task in themselves: paying, the cart, an order being followed, an address being typed, a search. A fact is
 * never put in front of these.
 */
const BUSY_ROUTES = [
  '/cart',
  '/checkout',
  '/order',
  '/orders',
  '/address',
  '/address-edit',
  '/profile',
  '/help',
  '/report',
  '/coupons',
  '/schedule',
  '/search',
  '/components',
];

/** Whether a fact may come up when this screen opens. Browsing screens only. */
export function momentAllowedOn(pathname: string): boolean {
  return !BUSY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export interface MomentCheck {
  /** How many screens the shopper has opened this run, counting this one (the first is 1). */
  count: number;
  /** Now, and when the last moment (a launch, a fact or an order placed) began; null when there has been none. */
  now: number;
  last: number | null;
  /** The screen that just opened. */
  pathname: string;
  /** The phone is set to reduce motion, or a screen reader is on: the shopper is not interrupted at all. */
  quiet: boolean;
}

/**
 * Whether a fact comes up now: on the first screen opened and then on every third, never twice within 20 seconds, never in front of
 * a task screen, and never for someone who has asked the phone for less motion or is using a screen reader.
 */
export function shouldShowFact(check: MomentCheck): boolean {
  if (check.quiet || !momentAllowedOn(check.pathname)) return false;
  if (check.count !== 1 && check.count % 3 !== 0) return false;
  return check.last === null || check.now - check.last > MOMENT_GAP_MS;
}
