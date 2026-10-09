/** Only the digits of what was typed, so "98765 43210", "+91 98765-43210" and "098765 43210" all come out the same. */
export function phoneDigits(typed: string): string {
  const digits = typed.replace(/\D/g, '');
  // A country code or a leading zero in front of a full number is dropped.
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/** An Indian mobile number: ten digits, starting with 6, 7, 8 or 9. */
export function isMobile(typed: string): boolean {
  return /^[6-9]\d{9}$/.test(phoneDigits(typed));
}

/** A number as it is shown, in two groups of five: "98765 43210". Anything that is not a full number is left as the digits typed. */
export function formatPhone(typed: string): string {
  const digits = phoneDigits(typed);
  return digits.length === 10 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}
