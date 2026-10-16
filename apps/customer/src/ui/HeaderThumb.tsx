import { useEffect, useState } from 'react';
import { Text as NativeText, Animated, Easing, StyleSheet, View } from 'react-native';
import { useStyles, type ThemeColors } from '@/theme';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/** What the picture beside a header's title shows: an emoji on a colour, and when there is more than one thing, how many more. */
export interface HeaderThumbContent {
  emoji: string;
  /** The colour behind the emoji. Leave out for the header's own pale control colour. */
  tint?: string;
  /** For example "+2", as a small bubble on the picture's lower right. */
  more?: string;
}

const SIZE = 38;
const MOVE_MS = 240;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    slot: { justifyContent: 'center', overflow: 'visible' },
    circle: {
      width: SIZE,
      height: SIZE,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.headerControl,
    },
    more: {
      position: 'absolute',
      right: -6,
      bottom: -4,
      minWidth: 22,
      height: 22,
      paddingHorizontal: space[1],
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: c.headerBg,
      backgroundColor: c.chrome,
    },
  });

/**
 * A small round picture that slides into a header, just before its title, once the page under it has been scrolled a little, and
 * folds away again at the top. It opens its own room (the title glides over to make space and back), fades and grows from a little
 * smaller, and does it all at once in a quarter of a second (straight away when the phone asks for reduced motion). It is only a
 * picture, so a screen reader skips it.
 */
export function HeaderThumb({
  shown,
  content,
}: {
  shown: boolean;
  content: HeaderThumbContent | undefined;
}) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(shown ? 1 : 0));
  const on = shown && content !== undefined;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(on ? 1 : 0);
      return undefined;
    }
    const move = Animated.timing(progress, {
      toValue: on ? 1 : 0,
      duration: MOVE_MS,
      easing: Easing.out(Easing.cubic),
      // The width changes layout, so it cannot run on the native driver.
      useNativeDriver: false,
    });
    move.start();
    return () => {
      move.stop();
    };
  }, [on, reduceMotion, progress]);

  if (content === undefined) return null;

  return (
    <Animated.View
      aria-hidden
      pointerEvents="none"
      style={[
        styles.slot,
        {
          width: progress.interpolate({ inputRange: [0, 1], outputRange: [0, SIZE] }),
          marginRight: progress.interpolate({ inputRange: [0, 1], outputRange: [0, space[3]] }),
          opacity: progress,
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
          ],
        },
      ]}
    >
      <View
        style={[styles.circle, content.tint !== undefined && { backgroundColor: content.tint }]}
      >
        <NativeText allowFontScaling={false} style={{ fontSize: 20, lineHeight: 26 }}>
          {content.emoji}
        </NativeText>
        {content.more !== undefined ? (
          <View style={styles.more}>
            <Text variant="caption" color="onChrome" maxFontSizeMultiplier={1} numberOfLines={1}>
              {content.more}
            </Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
