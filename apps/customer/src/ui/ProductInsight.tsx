import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface InsightRow {
  key: string;
  icon: IconName;
  /** One short line, already worded, for example "Sourced near Roha". */
  text: string;
  /** For a "keeps for" row: how many days it keeps, drawn as a row of small bars (one for each day of a week). */
  days?: number;
}

export interface ProductInsightProps {
  /** The card's heading, for example "Good to know". */
  title: string;
  rows: readonly InsightRow[];
  /** The round button's name when the card is shut and when it is open. */
  openLabel: string;
  closeLabel: string;
}

const WEEK = 7;
const BUTTON = 40;
const OPEN_MS = 220;
const CLOSE_MS = 160;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // Fills the picture it sits on, and lets touches through except on its own parts.
    layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    button: {
      position: 'absolute',
      right: space[2],
      bottom: space[2],
      width: BUTTON,
      height: BUTTON,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.scrim,
    },
    buttonOn: { backgroundColor: c.action },
    pressed: { opacity: 0.8 },
    card: {
      position: 'absolute',
      left: space[2],
      right: space[2] + BUTTON + space[2],
      bottom: space[2],
      gap: space[2],
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: space[2] },
    rowText: { flex: 1, minWidth: 0, gap: space[1] },
    pips: { flexDirection: 'row', gap: 3 },
    pip: { width: 14, height: 5, borderRadius: radius.full, backgroundColor: c.line },
    pipOn: { backgroundColor: c.accentEdge },
  });

/**
 * A small "i" button on the picture that opens a card of what is good to know about the product, then closes it
 * again (the same button turns into a cross, and a tap on the picture's card area is not needed). The rows are
 * only those that apply, each one line with an icon: where it comes from, how long it keeps (with a bar for each
 * day of the week, so freshness can be read at a glance), what it is good for, and its price per unit. The card
 * grows out of the button's corner and fades; with "reduce motion" on it simply appears.
 */
export function ProductInsight({ title, rows, openLabel, closeLabel }: ProductInsightProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  // Kept on screen until the closing animation has finished.
  const [mounted, setMounted] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(open ? 1 : 0);
      return undefined;
    }
    const move = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? OPEN_MS : CLOSE_MS,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    move.start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
    return () => {
      move.stop();
    };
  }, [open, reduceMotion, progress]);

  const toggle = () => {
    if (!open) setMounted(true);
    setOpen((current) => !current);
  };

  // With reduce motion on there is no closing animation to wait for.
  const showCard = open || (mounted && !reduceMotion);

  return (
    <View style={styles.layer} pointerEvents="box-none">
      {showCard ? (
        <Animated.View
          style={[
            styles.card,
            {
              opacity: progress,
              transform: [
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
              ],
            },
          ]}
        >
          <Text variant="strong" role="heading">
            {title}
          </Text>
          {rows.map((row) => {
            const days = row.days ?? 0;
            return (
              <View key={row.key} style={styles.row} accessible aria-label={row.text}>
                <Icon name={row.icon} color={colors.accentInk} size={16} />
                <View style={styles.rowText}>
                  <Text variant="small">{row.text}</Text>
                  {row.days !== undefined ? (
                    <View style={styles.pips} aria-hidden>
                      {Array.from({ length: WEEK }, (_, day) => (
                        <View key={day} style={[styles.pip, day < days && styles.pipOn]} />
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </Animated.View>
      ) : null}
      <Pressable
        role="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        onPress={toggle}
        style={({ pressed }) => [styles.button, open && styles.buttonOn, pressed && styles.pressed]}
      >
        <Icon
          name={open ? 'close' : 'sparkle'}
          color={open ? colors.onAction : colors.onChrome}
          size={22}
        />
      </Pressable>
    </View>
  );
}
