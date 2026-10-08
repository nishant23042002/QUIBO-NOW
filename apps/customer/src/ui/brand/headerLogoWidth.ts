import { SIZE } from './paths';

/** The header logo takes this share of the screen width, within the limits below. */
const SHARE = 0.3;
const MIN_WIDTH = 96;
/** At this width the logo is 43.8 dp tall, which still fits the shortest header (44 dp on an iPhone). */
const MAX_WIDTH = 120;

/** The width of the stacked logo in the header: it grows with the screen, but never outgrows the header. */
export function headerLogoWidth(screenWidth: number): number {
  return Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, screenWidth * SHARE)));
}

/** The height that goes with a width, keeping the logo's proportions. */
export function headerLogoHeight(width: number): number {
  return (width * SIZE.stacked.height) / SIZE.stacked.width;
}
