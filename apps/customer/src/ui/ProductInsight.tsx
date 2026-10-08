import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface InsightRow {
  key: string;
  /** What the fact is, for example "Healthy tip". Small and quiet, above the value. */
  label: string;
  /** The fact itself, in plain words. */
  value?: string;
  /** Instead of a sentence: a few short figures side by side, each a value over its name (calories, protein…). */
  stats?: readonly { label: string; value: string }[];
}

export interface ProductInsightProps {
  /** The card's name for a screen reader, for example "Good to know". */
  title: string;
  /** In the order they matter: the first is what the shopper most needs to know. */
  rows: readonly InsightRow[];
  /** The round button's name when the card is shut and when it is open. */
  openLabel: string;
  closeLabel: string;
  /** Told whenever the card opens or closes, so the page can move things out of its way (the saving ribbon). */
  onOpenChange?: (open: boolean) => void;
}

const BUTTON = 40;
/** The space between the picture's edge and the card and the button, the same on every side. */
const INSET = space[4];
const OPEN_MS = 220;
const CLOSE_MS = 160;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    // Fills the picture it sits on, and lets touches through except on its own parts.
    layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    button: {
      position: 'absolute',
      right: INSET,
      bottom: INSET,
      width: BUTTON,
      height: BUTTON,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.overlay,
    },
    pressed: { opacity: 0.8 },
    // Dark glass: the picture shows through faintly. It ends one gap before the button, so the two never touch.
    card: {
      position: 'absolute',
      left: INSET,
      right: INSET + BUTTON + space[2],
      bottom: INSET,
      borderRadius: radius.lg,
      backgroundColor: c.overlay,
      overflow: 'hidden',
      // It grows out of the button's corner.
      transformOrigin: 'bottom right',
    },
    content: { gap: space[3], padding: space[3] + 2 },
    row: { gap: 2 },
    // Two by two, so a figure like "145 kcal" never has to be cut short.
    stats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: space[3],
      rowGap: space[2],
      paddingTop: space[1],
    },
    stat: { flexGrow: 1, flexBasis: '40%', minWidth: 0 },
  });

/**
 * A sparkle button on the picture that opens a card of what is good to know about the product, and closes it again
 * (the same button turns into a cross). The card is dark glass over the picture: each fact is a small quiet label
 * with its value in white under it, the way a product label reads, and the facts come in order of how much the
 * shopper needs them. When there are more than fit on the picture, the card scrolls inside itself. It grows out of
 * the button's corner and fades; with "reduce motion" on it simply appears.
 */
export function ProductInsight({
  title,
  rows,
  openLabel,
  closeLabel,
  onOpenChange,
}: ProductInsightProps) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  // Kept on screen until the closing animation has finished.
  const [mounted, setMounted] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));
  // How tall the picture is, so the card never grows past it.
  const [room, setRoom] = useState(0);

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
    setOpen(!open);
    onOpenChange?.(!open);
  };

  // With reduce motion on there is no closing animation to wait for.
  const showCard = open || (mounted && !reduceMotion);

  return (
    <View
      style={styles.layer}
      pointerEvents="box-none"
      onLayout={(event) => {
        setRoom(Math.round(event.nativeEvent.layout.height));
      }}
    >
      {showCard ? (
        <Animated.View
          accessible
          role="summary"
          aria-label={`${title}. ${rows
            .map(
              (row) =>
                `${row.label}: ${
                  row.stats?.map((stat) => `${stat.label} ${stat.value}`).join(', ') ??
                  row.value ??
                  ''
                }`,
            )
            .join('. ')}`}
          style={[
            styles.card,
            {
              maxHeight: Math.max(0, room - INSET * 2),
              opacity: progress,
              transform: [
                { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
              ],
            },
          ]}
        >
          <ScrollView nestedScrollEnabled contentContainerStyle={styles.content}>
            {rows.map((row) => (
              <View key={row.key} style={styles.row} aria-hidden>
                <Text variant="caption" color="onOverlayMuted">
                  {row.label}
                </Text>
                {row.value !== undefined ? (
                  <Text variant="strong" color="onOverlay">
                    {row.value}
                  </Text>
                ) : null}
                {row.stats !== undefined ? (
                  <View style={styles.stats}>
                    {row.stats.map((stat) => (
                      <View key={stat.label} style={styles.stat}>
                        <Text variant="strong" color="onOverlay" numberOfLines={1}>
                          {stat.value}
                        </Text>
                        <Text variant="caption" color="onOverlayMuted" numberOfLines={1}>
                          {stat.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      ) : null}
      <Pressable
        role="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        onPress={toggle}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Icon name={open ? 'close' : 'sparkle'} color={colors.onOverlay} size={22} />
      </Pressable>
    </View>
  );
}
