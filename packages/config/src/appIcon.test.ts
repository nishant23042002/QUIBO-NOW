import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * The customer app's icon files are used by real builds, not by Expo Go, so nothing on a phone
 * check would catch a wrong one. This reads app.json and the PNG headers directly.
 */

const app = new URL('../../../apps/customer/', import.meta.url);
const PNG_SIGNATURE = '89504e470d0a1a0a';
/** PNG colour types in the header: 2 is RGB, 6 is RGB with transparency. */
const RGB = 2;
const RGBA = 6;

const expo = (JSON.parse(readFileSync(new URL('app.json', app), 'utf8')) as { expo: AppConfig })
  .expo;

interface AppConfig {
  icon: string;
  android: { adaptiveIcon: { foregroundImage: string; monochromeImage: string } };
}

function pngHeader(path: string) {
  const file = readFileSync(new URL(path, app));
  return {
    signature: file.subarray(0, 8).toString('hex'),
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
    colorType: file[25],
  };
}

describe('customer app icon files', () => {
  it('has a 1024 px icon with no transparency, which the App Store requires', () => {
    expect(pngHeader(expo.icon)).toEqual({
      signature: PNG_SIGNATURE,
      width: 1024,
      height: 1024,
      colorType: RGB,
    });
  });

  it.each(['foregroundImage', 'monochromeImage'] as const)(
    'has a 1024 px transparent Android %s',
    (key) => {
      expect(pngHeader(expo.android.adaptiveIcon[key])).toEqual({
        signature: PNG_SIGNATURE,
        width: 1024,
        height: 1024,
        colorType: RGBA,
      });
    },
  );
});
