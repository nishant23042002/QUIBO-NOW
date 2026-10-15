import { useId, useState } from 'react';
import {
  Text as NativeText,
  PanResponder,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, radius, space } from '@/ui';

export interface CompareSceneLabels {
  /** Names the slider for a screen reader. */
  scene: string;
  hint: string;
  darkName: string;
  darkSub: string;
  tape: string;
  shopName: string;
  shopSub: string;
  open: string;
}

const HEIGHT = 196;
/** The scene's height, so the loading skeleton keeps its room. */
export const COMPARE_SCENE_HEIGHT = HEIGHT;
const MIN = 0.1;
const MAX = 0.9;
/** How far one step of the screen reader's increase and decrease moves the divider. */
const STEP = 0.1;
const KNOB = 40;
const AWNING = 22;
const TAPE = 22;
const ART = 76;

const clamp = (value: number): number => Math.min(MAX, Math.max(MIN, value));

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    scene: {
      height: HEIGHT,
      borderRadius: radius.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.plumEnd,
      backgroundColor: c.night,
    },
    // The top of a container that holds the border and the corners.
    flush: { borderRadius: 0, borderWidth: 0 },
    // The sealed store: the night colour, so it is the darkest thing on the page in both themes.
    sealed: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: c.night,
    },
    art: { position: 'absolute', fontSize: ART, lineHeight: ART + 14 },
    darkArt: { left: space[5], top: space[4], opacity: 0.55 },
    lock: {
      position: 'absolute',
      left: 112,
      top: 22,
      width: KNOB,
      height: KNOB,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.plum,
    },
    tape: {
      position: 'absolute',
      left: -10,
      right: -10,
      top: 96,
      height: TAPE,
      transform: [{ rotate: '-4deg' }],
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.9,
    },
    tapeLabel: { paddingHorizontal: space[2], backgroundColor: c.overlay },
    darkCaption: {
      position: 'absolute',
      left: space[4],
      bottom: space[4],
      maxWidth: '44%',
      gap: 2,
    },
    shopLayer: { position: 'absolute', top: 0, bottom: 0, right: 0, overflow: 'hidden' },
    shop: { position: 'absolute', top: 0, bottom: 0, backgroundColor: c.accent },
    shopArt: { right: space[5], top: 28 },
    open: {
      position: 'absolute',
      right: 108,
      top: 30,
      paddingHorizontal: space[2],
      borderRadius: radius.sm,
      backgroundColor: c.plum,
    },
    shopCaption: {
      position: 'absolute',
      right: space[4],
      bottom: space[4],
      maxWidth: '44%',
      alignItems: 'flex-end',
      gap: 2,
    },
    divider: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 3,
      marginLeft: -1.5,
      backgroundColor: c.onNight,
    },
    knob: {
      position: 'absolute',
      top: HEIGHT / 2 - KNOB / 2,
      width: KNOB,
      height: KNOB,
      marginLeft: -KNOB / 2,
      borderRadius: radius.full,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.onNight,
    },
    hint: {
      position: 'absolute',
      top: space[3],
      alignSelf: 'center',
      paddingHorizontal: space[3],
      borderRadius: radius.full,
      backgroundColor: c.overlay,
    },
  });

/** A band of stripes that alternate two colours, slanted. `size` is the width of one stripe. */
function Stripes({
  first,
  second,
  size,
  height,
  slant = 0,
}: {
  first: string;
  second: string;
  size: number;
  height: number;
  slant?: number;
}) {
  const id = `stripes-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width="100%" height={height} aria-hidden>
      <Defs>
        <Pattern
          id={id}
          patternUnits="userSpaceOnUse"
          width={size * 2}
          height={height}
          patternTransform={`rotate(${slant})`}
        >
          <Rect x={0} y={0} width={size} height={height * 2} fill={first} />
          <Rect x={size} y={0} width={size} height={height * 2} fill={second} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height={height} fill={`url(#${id})`} />
    </Svg>
  );
}

/** Where the divider is, kept outside the render so a drag can read and move it without drawing the scene again for each touch. */
class Divider {
  at = 0.5;
  private from = 0.5;
  private width = 0;

  measure(width: number): void {
    this.width = width;
  }

  /** The finger went down: remember where the divider was. */
  begin(): void {
    this.from = this.at;
  }

  /** The finger has moved `dx` since it went down: the divider's new place, or undefined while the scene has no width yet. */
  drag(dx: number): number | undefined {
    if (this.width <= 0) return undefined;
    this.at = clamp(this.from + dx / this.width);
    return this.at;
  }

  /** A step by a screen reader's increase or decrease. */
  nudge(step: number): number {
    this.at = clamp(this.at + step);
    return this.at;
  }
}

/** Claims a mostly sideways move only, so the page still scrolls under a finger that goes up or down. */
function makeResponder(divider: Divider, onChange: (at: number) => void) {
  return PanResponder.create({
    onMoveShouldSetPanResponder: (_event, gesture) =>
      Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderGrant: () => {
      divider.begin();
    },
    onPanResponderMove: (_event, gesture) => {
      const next = divider.drag(gesture.dx);
      if (next !== undefined) onChange(next);
    },
    onPanResponderTerminationRequest: () => false,
  });
}

/**
 * The scene that opens "Know your shop" (ADR 0055, step 4): a sealed dark store on the left and an open shop on the right, with a
 * divider the customer drags to see more of one or the other. The shop is drawn full width and cut by the divider, so nothing in
 * it moves while it is dragged. The divider stays between 10% and 90%.
 *
 * It is a slider for a screen reader (increase and decrease move it a step). Dragging only claims a mostly sideways move, so the page
 * still scrolls when a finger goes up or down on it.
 */
export function CompareScene({
  labels,
  flush = false,
}: {
  labels: CompareSceneLabels;
  /** Drawn without its own border and rounded corners, as the top of a container that has them. */
  flush?: boolean;
}) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [at, setAt] = useState(0.5);
  const [divider] = useState(() => new Divider());
  const [responder] = useState(() => makeResponder(divider, setAt));

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    divider.measure(next);
    setWidth(next);
  };

  const onAction = (event: AccessibilityActionEvent) => {
    const { actionName } = event.nativeEvent;
    if (actionName === 'increment') setAt(divider.nudge(STEP));
    if (actionName === 'decrement') setAt(divider.nudge(-STEP));
  };

  const x = width * at;

  return (
    <View
      style={[styles.scene, flush && styles.flush]}
      onLayout={onLayout}
      accessible
      role="slider"
      aria-label={labels.scene}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(at * 100)}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={onAction}
      {...responder.panHandlers}
    >
      <View style={styles.sealed} />
      {width > 0 ? (
        <>
          <NativeText allowFontScaling={false} style={[styles.art, styles.darkArt]} aria-hidden>
            {'\u{1F3E2}'}
          </NativeText>
          <View style={styles.lock} aria-hidden>
            <NativeText allowFontScaling={false} style={{ fontSize: 20, lineHeight: 26 }}>
              {'\u{1F512}'}
            </NativeText>
          </View>
          <View style={styles.tape} aria-hidden>
            <View style={StyleSheet.absoluteFill}>
              <Stripes
                first={colors.tagBg}
                second={colors.overlay}
                size={14}
                height={TAPE}
                slant={45}
              />
            </View>
            <View style={styles.tapeLabel}>
              <Text
                variant="caption"
                color="onOverlay"
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
              >
                {labels.tape}
              </Text>
            </View>
          </View>
          <View style={styles.darkCaption}>
            <Text variant="subheading" color="onOverlay" maxFontSizeMultiplier={1.3}>
              {labels.darkName}
            </Text>
            <Text variant="caption" color="onOverlayMuted" maxFontSizeMultiplier={1.3}>
              {labels.darkSub}
            </Text>
          </View>

          <View style={[styles.shopLayer, { left: x }]}>
            <View style={[styles.shop, { left: -x, width }]}>
              <View style={{ height: AWNING }} aria-hidden>
                <Stripes
                  first={colors.plum}
                  second={colors.accentSubtle}
                  size={22}
                  height={AWNING}
                />
              </View>
              <NativeText allowFontScaling={false} style={[styles.art, styles.shopArt]} aria-hidden>
                {'\u{1F3EA}'}
              </NativeText>
              <View style={styles.open}>
                <Text
                  variant="caption"
                  color="accent"
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                >
                  {labels.open}
                </Text>
              </View>
              <View style={styles.shopCaption}>
                <Text
                  variant="subheading"
                  color="onAccent"
                  align="left"
                  maxFontSizeMultiplier={1.3}
                >
                  {labels.shopName}
                </Text>
                <Text variant="caption" color="onAccent" maxFontSizeMultiplier={1.3}>
                  {labels.shopSub}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { left: x }]} pointerEvents="none" aria-hidden />
          <View style={[styles.knob, { left: x }]} pointerEvents="none" aria-hidden>
            <Icon name="back" color={colors.plum} size={14} />
            <Icon name="chevronRight" color={colors.plum} size={14} />
          </View>
          <View style={styles.hint} pointerEvents="none" aria-hidden>
            <Text variant="caption" color="onOverlay" numberOfLines={1} maxFontSizeMultiplier={1.2}>
              {labels.hint}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}
