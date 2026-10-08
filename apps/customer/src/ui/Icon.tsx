import Svg, { Circle, Path } from 'react-native-svg';

/** One stroke weight, round ends, drawn on a 24 by 24 grid. */
const STROKE = 2.4;

type Shape = { kind: 'path'; d: string } | { kind: 'dot'; x: number; y: number; r: number };

const path = (d: string): Shape => ({ kind: 'path', d });
const dot = (x: number, y: number, r: number): Shape => ({ kind: 'dot', x, y, r });
/** A circle outline, written as a path so every shape is stroked the same way. */
const ring = (cx: number, cy: number, r: number): Shape =>
  path(`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`);

const SHAPES = {
  search: [ring(10.5, 10.5, 6.5), path('M15.5 15.5L21 21')],
  pin: [path('M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z'), dot(12, 9.5, 2.4)],
  chevron: [path('M6 9l6 6 6-6')],
  back: [path('M15 5l-7 7 7 7')],
  check: [path('M5 12.5l4.5 4.5L19 7.5')],
  close: [path('M6 6l12 12M18 6L6 18')],
  clock: [ring(12, 12, 9), path('M12 7v5.5l3.5 2')],
  sun: [
    ring(12, 12, 4.2),
    path(
      'M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8',
    ),
  ],
  moon: [path('M20 14.2A8.2 8.2 0 0 1 9.8 4 8.2 8.2 0 1 0 20 14.2z')],
  plus: [path('M12 5v14M5 12h14')],
  minus: [path('M5 12h14')],
  bag: [path('M5 8h14l-1 12H6L5 8z'), path('M9 8V6.5a3 3 0 0 1 6 0V8')],
  wifiOff: [
    path('M3 9a14 14 0 0 1 18 0M6 12.5a9.5 9.5 0 0 1 12 0M9 16a5 5 0 0 1 6 0'),
    dot(12, 19, 1.6),
    path('M4 4l16 16'),
  ],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof SHAPES;

export const ICON_NAMES = Object.keys(SHAPES) as IconName[];

interface IconProps {
  name: IconName;
  /** Pass a colour from useTheme(). */
  color: string;
  size?: number;
}

/** Decorative: whatever holds the icon (a button, a notice) carries the accessible name. */
export function Icon({ name, color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      {SHAPES[name].map((shape, index) =>
        shape.kind === 'path' ? (
          <Path
            key={index}
            d={shape.d}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <Circle key={index} cx={shape.x} cy={shape.y} r={shape.r} fill={color} />
        ),
      )}
    </Svg>
  );
}
