import { useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, G, Line, Polygon } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { radius } from './tokens';

/** A place on the map, in the same kind of numbers a real map uses. */
export interface MapPoint {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  west: number;
  east: number;
}

export interface MockMapProps {
  bounds: MapBounds;
  /** The areas we deliver to, shaded. */
  zones: readonly (readonly MapPoint[])[];
  pin: MapPoint | null;
  /** The pin is somewhere we do not deliver: it is drawn in the warning colour. */
  pinOutside?: boolean;
  onPick: (point: MapPoint) => void;
  /** What a screen reader says for the whole map, including whether the pin is placed. Pass a translated string. */
  label: string;
}

/** The map is this much wider than it is tall. */
const ASPECT = 0.7;
const GRID = 6;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    map: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.muted,
    },
  });

/**
 * A drawn stand-in for the map until the real one arrives (Phase 2): a plain ground with a faint grid, the delivery area
 * shaded, and a pin that goes where it is tapped. The rest of the address (the ward and the landmark) does the real work of
 * finding the door, as agreed for this phase. It is one control for a screen reader, which also has the form's own fields and
 * "use the town centre" to set a place without touching the map.
 */
export function MockMap({ bounds, zones, pin, pinOutside = false, onPick, label }: MockMapProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const height = Math.round(width * ASPECT);

  const x = (lng: number) => ((lng - bounds.west) / (bounds.east - bounds.west)) * width;
  const y = (lat: number) => ((bounds.north - lat) / (bounds.north - bounds.south)) * height;

  const pick = (event: GestureResponderEvent) => {
    if (width === 0) return;
    const { locationX, locationY } = event.nativeEvent;
    // A tap whose place is not known is ignored rather than put in a corner.
    if (!Number.isFinite(locationX) || !Number.isFinite(locationY)) return;
    const lng =
      bounds.west + (Math.min(Math.max(locationX, 0), width) / width) * (bounds.east - bounds.west);
    const lat =
      bounds.north -
      (Math.min(Math.max(locationY, 0), height) / height) * (bounds.north - bounds.south);
    onPick({ lat, lng });
  };

  return (
    // A responder, not a Pressable: its release carries where on the map the finger was, on the web and on a phone alike.
    <View
      accessible
      role="img"
      aria-label={label}
      onStartShouldSetResponder={() => true}
      onResponderRelease={pick}
      onLayout={(event) => {
        setWidth(Math.round(event.nativeEvent.layout.width));
      }}
      style={[styles.map, { height: height || undefined }]}
    >
      {width > 0 ? (
        <Svg width={width} height={height} pointerEvents="none">
          {Array.from({ length: GRID - 1 }, (_, index) => {
            const at = ((index + 1) / GRID) * width;
            const down = ((index + 1) / GRID) * height;
            return (
              <G key={index}>
                <Line x1={at} y1={0} x2={at} y2={height} stroke={colors.line} strokeWidth={1} />
                <Line x1={0} y1={down} x2={width} y2={down} stroke={colors.line} strokeWidth={1} />
              </G>
            );
          })}
          {zones.map((zone, index) => (
            <Polygon
              key={index}
              points={zone.map((point) => `${x(point.lng)},${y(point.lat)}`).join(' ')}
              fill={colors.accentSubtle}
              stroke={colors.accentEdge}
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          ))}
          {pin !== null ? (
            <>
              <Circle
                cx={x(pin.lng)}
                cy={y(pin.lat)}
                r={14}
                fill={pinOutside ? colors.danger : colors.action}
                opacity={0.2}
              />
              <Circle
                cx={x(pin.lng)}
                cy={y(pin.lat)}
                r={7}
                fill={pinOutside ? colors.danger : colors.action}
                stroke={colors.surface}
                strokeWidth={2.5}
              />
            </>
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}
