import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface PopoverProps {
  /** What the popover says. Keep it short: it is a small bubble, not a page. */
  content: ReactNode;
  /** What a screen reader calls the popover. Pass a translated string. */
  label: string;
  /** Name of the tap-anywhere-else-to-close area for screen readers, for example "Close". */
  closeLabel: string;
  /** What a screen reader calls the thing that opens it, when it has no readable text of its own (an icon). */
  triggerLabel?: string;
  /** What is drawn inside the thing that opens it: an icon, or some text. */
  children: ReactNode;
  /** How the thing that opens it looks. */
  style?: StyleProp<ViewStyle>;
  /** How far outside its look a tap still counts, for a small icon. */
  hitSlop?: number;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Shown {
  /** Where the trigger is, measured from the host's top left corner. */
  rect: Rect;
  content: ReactNode;
  label: string;
  closeLabel: string;
}

interface PopoverApi {
  show: (anchor: RefObject<View | null>, what: Omit<Shown, 'rect'>) => void;
}

const PopoverContext = createContext<PopoverApi | null>(null);

/** The least room kept between the bubble and the host's edge, and the gap between the bubble and its trigger. */
const MARGIN = space[3];
const GAP = space[1] + 2;
const MAX_WIDTH = 264;
const ARROW = 10;
const FADE_MS = 140;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    bubble: {
      position: 'absolute',
      gap: space[1],
      paddingHorizontal: space[3],
      paddingVertical: space[3],
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
      shadowColor: c.scrim,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    // A square turned 45 degrees: half of it pokes out of the bubble as the pointer, and its outer two edges carry the
    // bubble's border, so it looks like one piece with it.
    arrow: {
      position: 'absolute',
      width: ARROW,
      height: ARROW,
      backgroundColor: c.surface,
      borderColor: c.line,
      transform: [{ rotate: '45deg' }],
    },
    arrowUp: { top: -ARROW / 2 - 1, borderTopWidth: 1, borderLeftWidth: 1 },
    arrowDown: { bottom: -ARROW / 2 - 1, borderBottomWidth: 1, borderRightWidth: 1 },
  });

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), Math.max(low, high));

/**
 * The place popovers open in. Wrap a screen's content in it and every `Popover` inside draws its bubble here, on top of
 * the screen's other content. Because the trigger and the bubble are measured in the same window and placed relative to
 * the host, the bubble lands exactly under its trigger, whatever the phone's status bar or navigation bar do (a separate
 * window would not share their coordinates). The bubble stays inside the host, points at the trigger, opens above it
 * when there is no room below, and closes with a tap anywhere else or the phone's back button.
 */
export function PopoverHost({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const host = useRef<View>(null);
  const [hostSize, setHostSize] = useState({ width: 0, height: 0 });
  const [shown, setShown] = useState<Shown | null>(null);
  // The bubble's own size, known only once it has been drawn; until then it is drawn invisible.
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [fade] = useState(() => new Animated.Value(0));

  const api = useMemo<PopoverApi>(
    () => ({
      show: (anchor, what) => {
        host.current?.measureInWindow((hostX, hostY) => {
          anchor.current?.measureInWindow((x, y, width, height) => {
            setSize(null);
            setShown({ rect: { x: x - hostX, y: y - hostY, width, height }, ...what });
          });
        });
      },
    }),
    [],
  );

  const open = shown !== null;
  useEffect(() => {
    // The phone's back button exists on Android only (the web has none, and BackHandler throws there).
    if (!open || Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setShown(null);
      return true;
    });
    return () => {
      subscription.remove();
    };
  }, [open]);

  useEffect(() => {
    if (size === null) {
      fade.setValue(0);
      return undefined;
    }
    if (reduceMotion) {
      fade.setValue(1);
      return undefined;
    }
    const show = Animated.timing(fade, {
      toValue: 1,
      duration: FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    show.start();
    return () => {
      show.stop();
    };
  }, [size, reduceMotion, fade]);

  const width = Math.min(MAX_WIDTH, hostSize.width - MARGIN * 2);
  let left: number = MARGIN;
  let top: number = 0;
  let above = false;
  let arrowAt: number = ARROW;
  if (shown !== null) {
    const { rect } = shown;
    const centre = rect.x + rect.width / 2;
    left = clamp(centre - width / 2, MARGIN, hostSize.width - MARGIN - width);
    arrowAt = clamp(centre - left - ARROW / 2, space[3], width - space[3] - ARROW);
    const below = rect.y + rect.height + GAP;
    top = below;
    if (size !== null) {
      // Not enough room under the trigger: open above it instead.
      above = below + size.height > hostSize.height - MARGIN;
      if (above) top = Math.max(MARGIN, rect.y - GAP - size.height);
    }
  }

  return (
    <PopoverContext.Provider value={api}>
      <View
        ref={host}
        collapsable={false}
        style={style}
        onLayout={(event) => {
          const { width: w, height: h } = event.nativeEvent.layout;
          setHostSize((current) =>
            current.width === w && current.height === h ? current : { width: w, height: h },
          );
        }}
      >
        {children}
        {shown !== null ? (
          <>
            <Pressable
              role="button"
              aria-label={shown.closeLabel}
              style={styles.backdrop}
              onPress={() => {
                setShown(null);
              }}
            />
            <Animated.View
              aria-label={shown.label}
              onLayout={(event) => {
                const { width: w, height: h } = event.nativeEvent.layout;
                setSize((current) =>
                  current !== null && current.width === w && current.height === h
                    ? current
                    : { width: w, height: h },
                );
              }}
              style={[styles.bubble, { left, top, width, opacity: size === null ? 0 : fade }]}
            >
              {shown.content}
              <View
                pointerEvents="none"
                style={[styles.arrow, above ? styles.arrowDown : styles.arrowUp, { left: arrowAt }]}
                aria-hidden
              />
            </Animated.View>
          </>
        ) : null}
      </View>
    </PopoverContext.Provider>
  );
}

/**
 * A small bubble that opens against the thing that was tapped, on top of the page and without moving it: for the (i)
 * beside a charge, say. The thing that opens it is drawn here (a pressable around `children`), so the bubble can be placed
 * against it. It needs a `PopoverHost` around the screen. Tapping again opens it again rather than stacking.
 */
export function Popover({
  content,
  label,
  closeLabel,
  triggerLabel,
  children,
  style,
  hitSlop,
}: PopoverProps) {
  const api = useContext(PopoverContext);
  if (api === null) throw new Error('Popover must be used inside PopoverHost');
  const anchor = useRef<View>(null);

  return (
    <Pressable
      ref={anchor}
      role="button"
      {...(triggerLabel !== undefined ? { 'aria-label': triggerLabel } : {})}
      {...(hitSlop !== undefined ? { hitSlop } : {})}
      onPress={() => {
        api.show(anchor, { content, label, closeLabel });
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.6 }]}
    >
      {children}
    </Pressable>
  );
}
