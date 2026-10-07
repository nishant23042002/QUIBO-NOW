import { DEFAULT_LOCALE, loadMessages } from '@quibo/i18n';
import type { MetadataRoute } from 'next';

// The manifest is one file for the whole site, so it uses the default language. The colours
// repeat --qb-color-brand and --qb-color-canvas from packages/ui (CSS variables cannot be read here).
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const messages = await loadMessages(DEFAULT_LOCALE);

  return {
    name: messages.app.name,
    short_name: messages.app.name,
    description: messages.app.description,
    lang: DEFAULT_LOCALE,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#faf9f5',
    theme_color: '#1b6b3a',
    icons: [
      { src: '/pwa-icons/192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
