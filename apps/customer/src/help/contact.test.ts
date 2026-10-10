import { describe, expect, it } from 'vitest';
import { telLink, whatsAppLink } from './contact';

describe('telLink', () => {
  it('dials a ten-digit number with the country code', () => {
    expect(telLink('9011285958')).toBe('tel:+919011285958');
  });
});

describe('whatsAppLink', () => {
  it('opens a chat with the number', () => {
    expect(whatsAppLink('919011285958')).toBe('https://wa.me/919011285958');
  });

  it('puts a message in the link, safely encoded', () => {
    expect(whatsAppLink('919011285958', 'Hi, order #3F76 & help')).toBe(
      'https://wa.me/919011285958?text=Hi%2C%20order%20%233F76%20%26%20help',
    );
  });

  it('leaves the message out when it is empty', () => {
    expect(whatsAppLink('919011285958', '')).toBe('https://wa.me/919011285958');
  });
});
