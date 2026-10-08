import { useEffect, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { Collapsible } from './Collapsible';
import { ShopInfoCard, type ShopInfoCardProps } from './ShopInfoCard';
import { Text } from './Text';
import { space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

export interface ShopsPanelProps {
  open: boolean;
  /** Says once that every shop is verified, for example "Verified local shops in Roha". */
  title: string;
  shops: readonly (ShopInfoCardProps & { id: string })[];
}

/** How far each card's entrance is delayed after the one before it, and how long one card's entrance takes, as a share of the whole. */
const STEP = 0.14;
const SHARE = 0.4;
const RISE = 10;
const OPEN_MS = 560;
const CLOSE_MS = 140;

const styles = StyleSheet.create({
  panel: { gap: space[2], paddingTop: space[3] },
  title: { paddingHorizontal: space[4] },
  row: { gap: space[3], paddingHorizontal: space[4], paddingBottom: space[1] },
});

/**
 * The shops that open under the chip on Home: a title and one swipeable row of compact cards. The panel
 * slides open, and the cards rise and fade in one after another, so it feels like it is being dealt out.
 * One animated value drives every card; each card just starts a little later along it.
 */
export function ShopsPanel({ open, title, shops }: ShopsPanelProps) {
  const reduceMotion = useReduceMotion();
  const [entrance] = useState(() => new Animated.Value(open ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      entrance.setValue(open ? 1 : 0);
      return undefined;
    }
    const animation = Animated.timing(entrance, {
      toValue: open ? 1 : 0,
      duration: open ? OPEN_MS : CLOSE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [open, reduceMotion, entrance]);

  return (
    <Collapsible open={open}>
      <View style={styles.panel}>
        <View style={styles.title}>
          <Text variant="strong" color="onHeaderMuted">
            {title}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {shops.map(({ id, ...shop }, index) => {
            // Cards after the fourth share the last start, so a long list never runs past the end of the animation.
            const start = Math.min(index * STEP, 1 - SHARE);
            const range = [start, start + SHARE];
            return (
              <Animated.View
                key={id}
                style={{
                  opacity: entrance.interpolate({
                    inputRange: range,
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      translateY: entrance.interpolate({
                        inputRange: range,
                        outputRange: [RISE, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                }}
              >
                <ShopInfoCard {...shop} />
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    </Collapsible>
  );
}
