import { describe, expect, it } from 'vitest';
import appConfig from '../app.json';
import { palettes } from './theme/palette';

/*
 * The app icon is used by real builds, not by Expo Go, so a phone check would never catch a wrong
 * setting. The icon files themselves (size, transparency) are checked in packages/config, which can
 * read files; this app cannot, because it has no Node types by design.
 */

const { icon, android } = appConfig.expo;

describe('app icon settings', () => {
  it('point at the three icon files', () => {
    expect(icon).toBe('./assets/icon.png');
    expect(android.adaptiveIcon.foregroundImage).toBe('./assets/adaptive-icon.png');
    expect(android.adaptiveIcon.monochromeImage).toBe('./assets/adaptive-icon-monochrome.png');
  });

  it('put the Android icon on the same aubergine as the header', () => {
    // app.json cannot import the palette, so this is the one place the copy is kept honest.
    expect(android.adaptiveIcon.backgroundColor.toLowerCase()).toBe(
      palettes.light.chrome.toLowerCase(),
    );
  });
});
