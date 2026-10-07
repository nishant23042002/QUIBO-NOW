import type { Page } from '@playwright/test';

/**
 * Measure the WCAG contrast of every visible text node on the page and return the ones that
 * fail AA (4.5:1, or 3:1 for large text), as readable strings. Empty means all pass.
 *
 * axe-core does its own contrast check but silently skips some Devanagari text (verified in
 * Phase 0: the Hindi subtitle and the active "हिन्दी" link on /hi), and Hindi and Marathi are
 * launch languages. This check reads the browser's computed colours directly, so it measures
 * every language. It handles opaque backgrounds, which is all the design tokens use.
 */
export async function lowContrastText(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    type Rgba = [number, number, number, number];

    const parse = (color: string): Rgba => {
      const parts =
        /rgba?\(([^)]+)\)/
          .exec(color)?.[1]
          ?.split(/[\s,/]+/)
          .filter(Boolean) ?? [];
      const [r = 0, g = 0, b = 0, a = 1] = parts.map(Number);
      return [r, g, b, a];
    };
    const luminance = ([r, g, b]: Rgba): number => {
      const channel = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const ratio = (a: Rgba, b: Rgba): number => {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
      return (light + 0.05) / (dark + 0.05);
    };
    // The first opaque background walking up from the element is what the text sits on.
    const backgroundOf = (start: Element | null): Rgba => {
      for (let el = start; el; el = el.parentElement) {
        const bg = parse(getComputedStyle(el).backgroundColor);
        if (bg[3] === 1) return bg;
      }
      return [255, 255, 255, 1];
    };

    const failures: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent?.trim();
      const element = node.parentElement;
      if (!text || !element) continue;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') continue;

      const size = parseFloat(style.fontSize);
      const bold = Number.parseInt(style.fontWeight, 10) >= 700;
      const needed = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
      const actual = ratio(parse(style.color), backgroundOf(element));
      if (actual < needed) {
        failures.push(`"${text.slice(0, 30)}" has contrast ${actual.toFixed(2)}, needs ${needed}`);
      }
    }
    return failures;
  });
}
