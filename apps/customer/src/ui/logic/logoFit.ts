/** How much of the room a logo's picture may fill, as an area. Wide and tall logos are limited by their edge instead (below). */
export const LOGO_FILL = 0.74;

export interface LogoSize {
  width: number;
  height: number;
}

/**
 * The size to draw a logo at inside a room of `box`, so a row of different logos has one visual weight. Logos come in every shape
 * (a wide wordmark, a round badge, a tall gate): giving each the same width would make the tall ones huge, and the same height would
 * make the wide ones tiny. Each gets the same *area* (a share of the room, `LOGO_FILL`), never more than the room's width or height.
 * `aspect` is the picture's width over its height.
 */
export function fitLogo(aspect: number, box: LogoSize): LogoSize {
  if (!(aspect > 0) || box.width <= 0 || box.height <= 0) return { width: 0, height: 0 };
  const area = LOGO_FILL * box.width * box.height;
  let width = Math.sqrt(area * aspect);
  let height = width / aspect;
  if (width > box.width) {
    width = box.width;
    height = width / aspect;
  }
  if (height > box.height) {
    height = box.height;
    width = height * aspect;
  }
  return { width: Math.round(width), height: Math.round(height) };
}
