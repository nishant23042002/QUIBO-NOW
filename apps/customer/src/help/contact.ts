/** The link that dials a ten-digit Indian number. */
export function telLink(phone: string): string {
  return `tel:+91${phone}`;
}

/**
 * The link that opens WhatsApp with a message already typed. `wa.me` works with the app installed or in a browser. `number` is
 * the full number with the country code and no plus.
 */
export function whatsAppLink(number: string, message?: string): string {
  const base = `https://wa.me/${number}`;
  return message === undefined || message === ''
    ? base
    : `${base}?text=${encodeURIComponent(message)}`;
}
