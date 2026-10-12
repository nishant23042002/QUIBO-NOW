/**
 * A colour part of the way from one hex colour to another: `amount` 0 is `from`, 1 is `to`. It is for the few places that need a
 * shade between two theme colours (the picture stage under the product header, which is the header's tint eased toward the page),
 * so no new colour has to be added to the palette. Anything that is not a six-digit hex colour comes back as `from`.
 */
export function mixColor(from: string, to: string, amount: number): string {
  const a = parse(from);
  const b = parse(to);
  if (a === null || b === null) return from;
  const t = Math.min(1, Math.max(0, amount));
  const channel = (index: 0 | 1 | 2) => Math.round(a[index] + (b[index] - a[index]) * t);
  return `#${[channel(0), channel(1), channel(2)].map((value) => value.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function parse(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (match === null) return null;
  return [
    parseInt(match[1] ?? '0', 16),
    parseInt(match[2] ?? '0', 16),
    parseInt(match[3] ?? '0', 16),
  ];
}
