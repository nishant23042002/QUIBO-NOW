import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme';

export interface DietMarkProps {
  /** Vegetarian (a green dot in a green square) or non-vegetarian (a red triangle in a red square), as on Indian food packs. */
  kind: 'veg' | 'nonveg';
  /** Names the mark for a screen reader, for example "Vegetarian". Pass a translated string. */
  label: string;
  size?: number;
}

/** The small square mark that says whether a food item is vegetarian. */
export function DietMark({ kind, label, size = 16 }: DietMarkProps) {
  const { colors } = useTheme();
  const paint = kind === 'veg' ? colors.success : colors.danger;

  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-label={label}>
      <Rect
        x={1.5}
        y={1.5}
        width={13}
        height={13}
        rx={2.5}
        fill="none"
        stroke={paint}
        strokeWidth={1.5}
      />
      {kind === 'veg' ? (
        <Circle cx={8} cy={8} r={3.6} fill={paint} />
      ) : (
        <Path d="M8 4.2L12 11.4H4Z" fill={paint} />
      )}
    </Svg>
  );
}
