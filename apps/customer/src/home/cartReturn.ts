/**
 * The cart's steps (delivery time, coupons) are opened from the cart and go back to it. Coming back is not opening the
 * cart again, so the cart should not show its skeleton then: its content is already there. A step calls
 * `armQuietCartReturn` just before it goes back, and the cart takes the note when it comes to the front.
 */
let armed = false;

export function armQuietCartReturn(): void {
  armed = true;
}

/** True once, if a step has just gone back to the cart. */
export function takeQuietCartReturn(): boolean {
  const was = armed;
  armed = false;
  return was;
}
