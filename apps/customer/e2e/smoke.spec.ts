import { createRequire } from 'node:module';
import AxeBuilder from '@axe-core/playwright';
import type { Messages } from '@quibo/i18n';
import { expect, test, type Page } from '@playwright/test';
import { lowContrastText } from './contrast';

// The expected text comes from the same message files the app renders, so a copy change never
// needs a test change and a missing key cannot pass silently.
const load = createRequire(import.meta.url);
const messages = {
  en: load('@quibo/i18n/messages/en.json') as Messages,
  hi: load('@quibo/i18n/messages/hi.json') as Messages,
  mr: load('@quibo/i18n/messages/mr.json') as Messages,
};
const LOCALES = ['en', 'hi', 'mr'] as const;

async function expectHomeIn(page: Page, locale: (typeof LOCALES)[number]) {
  await expect(page).toHaveURL(new RegExp(`/${locale}$`));
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages[locale].home.title);
  await expect(page.getByText(messages[locale].home.subtitle)).toBeVisible();
}

test.describe('home page', () => {
  test('/ goes to the default language and loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBe(true);
    await expectHomeIn(page, 'en');
    await expect(page).toHaveTitle(messages.en.app.name);
  });

  for (const locale of LOCALES) {
    test(`/${locale} shows its own language`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expectHomeIn(page, locale);
      await expect(page.getByText(messages[locale].home.windowNote)).toBeVisible();
    });
  }

  test('loads with no console errors and no failed requests', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
    page.on('response', (response) => {
      if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
    });
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
  });

  test('an unknown language is a 404, not a broken page', async ({ page }) => {
    const response = await page.goto('/fr');
    expect(response?.status()).toBe(404);
  });
});

test.describe('language switcher', () => {
  test('changes the visible text and the document language: en, hi, mr, back to en', async ({
    page,
  }) => {
    await page.goto('/en');
    const switcher = page.getByRole('navigation', { name: messages.en.language.label });

    for (const locale of ['hi', 'mr', 'en'] as const) {
      // Each link is named in its own language, whichever language the page is in.
      await page
        .getByRole('navigation')
        .getByRole('link', { name: messages.en.language[locale] })
        .click();
      await expectHomeIn(page, locale);
      await expect(
        page
          .getByRole('navigation', { name: messages[locale].language.label })
          .getByRole('link', { name: messages[locale].language[locale] }),
      ).toHaveAttribute('aria-current', 'true');
    }
    await expect(switcher).toBeVisible();
  });

  test('tags every link with its own language', async ({ page }) => {
    await page.goto('/hi');
    for (const locale of LOCALES) {
      const link = page.getByRole('link', { name: messages.hi.language[locale] });
      await expect(link).toHaveAttribute('lang', locale);
      await expect(link).toHaveAttribute('href', `/${locale}`);
    }
  });

  test('has touch targets of at least 48px', async ({ page }) => {
    await page.goto('/mr');
    for (const locale of LOCALES) {
      const box = await page
        .getByRole('link', { name: messages.mr.language[locale] })
        .boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(48);
      expect(box?.width).toBeGreaterThanOrEqual(48);
    }
  });

  test.describe('with JavaScript off', () => {
    test.use({ javaScriptEnabled: false });

    test('still switches language, because the switcher is plain links', async ({ page }) => {
      await page.goto('/en');
      await page.getByRole('link', { name: messages.en.language.hi }).click();
      await expectHomeIn(page, 'hi');
    });
  });
});

test.describe('language detection', () => {
  test.describe('a Hindi browser', () => {
    test.use({ locale: 'hi-IN' });

    test('is sent from / to /hi', async ({ page }) => {
      await page.goto('/');
      await expectHomeIn(page, 'hi');
    });
  });

  test.describe('a Marathi browser', () => {
    test.use({ locale: 'mr-IN' });

    test('is sent from / to /mr', async ({ page }) => {
      await page.goto('/');
      await expectHomeIn(page, 'mr');
    });
  });
});

test.describe('web app manifest', () => {
  test('is linked and describes an installable app', async ({ page, request }) => {
    await page.goto('/en');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      '/manifest.webmanifest',
    );
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /pwa-icons/);

    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBe(true);
    const manifest = (await response.json()) as {
      name: string;
      display: string;
      start_url: string;
      theme_color: string;
      background_color: string;
      icons: { src: string; sizes: string; type: string; purpose: string }[];
    };

    expect(manifest.name).toBe(messages.en.app.name);
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);

    const find = (sizes: string, purpose: string) =>
      manifest.icons.find((icon) => icon.sizes === sizes && icon.purpose === purpose);
    expect(find('192x192', 'any')).toBeDefined();
    expect(find('512x512', 'any')).toBeDefined();
    expect(find('512x512', 'maskable')).toBeDefined();
  });

  test('has icons that are real PNGs of the size they claim', async ({ request }) => {
    const manifest = (await (await request.get('/manifest.webmanifest')).json()) as {
      icons: { src: string; sizes: string }[];
    };
    for (const icon of manifest.icons) {
      const response = await request.get(icon.src);
      expect(response.status(), icon.src).toBe(200);
      expect(response.headers()['content-type']).toBe('image/png');
      const bytes = await response.body();
      // PNG signature, then the IHDR chunk holds width and height as big-endian integers.
      expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');
      const size = `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
      expect(size, icon.src).toBe(icon.sizes);
    }
  });
});

test.describe('layout and accessibility', () => {
  for (const locale of LOCALES) {
    test(`/${locale} has no axe violations`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    // axe skips some Devanagari text for contrast, so every text node is measured directly too.
    test(`/${locale} has AA contrast on every piece of text`, async ({ page }) => {
      await page.goto(`/${locale}`);
      expect(await lowContrastText(page)).toEqual([]);
    });

    test(`/${locale} does not scroll sideways, even at 200% text size`, async ({ page }) => {
      await page.goto(`/${locale}`);
      for (const fontSize of ['100%', '200%']) {
        await page.addStyleTag({ content: `html { font-size: ${fontSize}; }` });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `at ${fontSize}`).toBeLessThanOrEqual(0);
      }
    });
  }
});

test.describe('the contrast check itself', () => {
  test('flags low-contrast text, including Devanagari', async ({ page }) => {
    await page.goto('/hi');
    await page.evaluate(() => {
      const bad = document.createElement('p');
      bad.textContent = 'हिन्दी';
      bad.style.cssText = 'color: #777777; background: #888888; font-size: 18px;';
      document.body.append(bad);
    });
    const failures = await lowContrastText(page);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('हिन्दी');
  });

  test('accepts large text at 3:1 but not small text', async ({ page }) => {
    await page.goto('/en');
    await page.evaluate(() => {
      // #949494 on white is about 3.0:1: fine at 32px, not at 16px.
      for (const [label, size] of [
        ['big', '32px'],
        ['small', '16px'],
      ] as const) {
        const p = document.createElement('p');
        p.textContent = label;
        p.style.cssText = `color: #949494; background: #ffffff; font-size: ${size};`;
        document.body.append(p);
      }
    });
    const failures = await lowContrastText(page);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain('small');
  });
});
