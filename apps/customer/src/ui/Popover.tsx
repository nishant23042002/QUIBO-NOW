import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, type ThemeColors } from '@/theme';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** What the trigger needs to open the popover and sit under it. */
export interface PopoverTrigger {
  /** Put this on the pressable that opens the popover: the popover is placed against it. */
  anchor: RefObject<View | null>;
  onPress: () => void;
}

export interface PopoverProps {
  /** What the popover says. Keep it short: it is a small bubble, not a page. */
  content: ReactNode;
  /** What a screen reader calls the popover. Pass a translated string. */
  label: string;
  /** Name of the tap-anywhere-else-to-close area for screen readers, for example "Close". */
  closeLabel: string;
  /** Draws the thing that opens it, given what it needs. */
  children: (trigger: PopoverTrigger) => ReactNode;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The least room kept between the bubble and the screen's edge, and the gap between the bubble and its trigger. */
const MARGIN = space[3];
const GAP = space[2];
const MAX_WIDTH = 320;
const ARROW = 12;
const FADE_MS = 140;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    bubble: {
      position: 'absolute',
      gap: space[2],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
      shadowColor: c.scrim,
      shadowOpacity: 0.4,
      shadowRadius: 14,
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
 * A small bubble that opens against the thing that was tapped, on top of everything and without moving the page: for the
 * (i) beside a charge, say. It sits under the trigger, or above it when there is no room below, stays inside the screen,
 * points at the trigger, and closes with a tap anywhere else or the phone's back button. Tapping the trigger again
 * opens it again rather than stacking.
 */
export function Popover({ content, label, closeLabel, children }: PopoverProps) {
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const anchor = useRef<View>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  // The bubble's own size, known only once it has been drawn; until then it is drawn invisible.
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [fade] = useState(() => new Animated.Value(0));

  const open = () => {
    anchor.current?.measureInWindow((x, y, width, height) => {
      setSize(null);
      setRect({ x, y, width, height });
    });
  };

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

  const width = Math.min(MAX_WIDTH, screenW - MARGIN * 2);
  let left: number = MARGIN;
  let top: number = 0;
  let above = false;
  let arrowAt: number = ARROW;
  if (rect !== null) {
    const centre = rect.x + rect.width / 2;
    left = clamp(centre - width / 2, MARGIN, screenW - MARGIN - width);
    arrowAt = clamp(centre - left - ARROW / 2, space[4], width - space[4] - ARROW);
    const below = rect.y + rect.height + GAP;
    top = below;
    if (size !== null) {
      // Not enough room under the trigger: open above it instead.
      above = below + size.height > screenH - insets.bottom - MARGIN;
      if (above) top = Math.max(insets.top + MARGIN, rect.y - GAP - size.height);
    }
  }

  return (
    <>
      {children({ anchor, onPress: open })}
      <Modal
        visible={rect !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => {
          setRect(null);
        }}
      >
        <Pressable
          role="button"
          aria-label={closeLabel}
          style={styles.backdrop}
          onPress={() => {
            setRect(null);
          }}
        />
        <Animated.View
          aria-label={label}
          aria-modal
          onLayout={(event) => {
            const { width: w, height: h } = event.nativeEvent.layout;
            setSize((current) =>
              current !== null && current.width === w && current.height === h
                ? current
                : { width: w, height: h },
            );
          }}
          style={[
            styles.bubble,
            {
              left,
              top,
              width,
              opacity: size === null ? 0 : fade,
            },
          ]}
        >
          {content}
          <View
            pointerEvents="none"
            style={[styles.arrow, above ? styles.arrowDown : styles.arrowUp, { left: arrowAt }]}
            aria-hidden
          />
        </Animated.View>
      </Modal>
    </>
  );
}
