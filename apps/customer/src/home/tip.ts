import { money, type Money } from '@quibo/contracts';

/**
 * Reads a tip typed in whole rupees. It must be a whole number from 1 rupee up to the most a tip may be; anything else
 * (empty, a decimal, letters, too much) is not a tip. The result is in integer paise.
 */
export function parseTip(text: string, max: Money): Money | undefined {
  const trimmed = text.trim();
  if (!/^\d{1,6}$/.test(trimmed)) return undefined;
  const rupees = Number(trimmed);
  if (rupees < 1) return undefined;
  const paise = rupees * 100;
  return paise > max ? undefined : money(paise);
}

/** Whether a tip is one of the ready-made amounts (as opposed to one the shopper typed). */
export function isPreset(amount: Money, options: readonly Money[]): boolean {
  return options.includes(amount);
}
