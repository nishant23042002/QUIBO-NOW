import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { ShopInfoCard, type ShopInfoCardProps } from './ShopInfoCard';
import { Text } from './Text';
import { space } from './tokens';

export interface ShopsPanelProps {
  /** 0 while shut, 1 while open, moved by the header with the phone's native animation. */
  progress: Animated.Value;
  open: boolean;
  /** The tint behind the panel, the same as the header around it. */
  background: Animated.AnimatedInterpolation<string> | string;
  /** The panel's own height, once it has been measured (0 until then). */
  height: number;
  onHeight: (height: number) => void;
  /** Says once that every shop is verified, for example "Verified local shops in Roha". */
  title: string;
  shops: readonly (ShopInfoCardProps & { id: string })[];
}

/** How far each card's entrance is delayed after the one before it, and how long one card's entrance takes, as a share of the whole. */
const STEP = 0.12;
const SHARE = 0.45;
const RISE = 10;

const styles = StyleSheet.create({
  // A window exactly the panel's size. The panel is always laid out at that size and only moves inside it,
  // so opening costs no layout work at all.
  clip: { overflow: 'hidden' },
  measuring: { opacity: 0 },
  panel: { gap: space[2], paddingTop: space[3], paddingBottom: space[1] },
  title: { paddingHorizontal: space[4] },
  row: { gap: space[3], paddingHorizontal: space[4], paddingBottom: space[1] },
});

/**
 * The shops that open under the chip on Home: a title and one swipeable row of compact cards. The panel is
 * not resized to open: it is drawn once at its full size, sitting just above its place and hidden by the
 * window around it, and `progress` slides it down into view (the header slides the search bar and the page
 * down by the same amount, so it looks pushed open). The cards rise and fade in one after another.
 * Everything that moves is a transform or an opacity, which the phone animates on its own thread.
 */
export function ShopsPanel({
  progress,
  open,
  background,
  height,
  onHeight,
  title,
  shops,
}: ShopsPanelProps) {
  return (
    <View style={[styles.clip, height > 0 ? { height } : styles.measuring]} aria-hidden={!open}>
      {/* The slide (native) and the tint (not native) are on two separate nodes: one node cannot have both. */}
      <Animated.View
        style={{
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-height, 0],
              }),
            },
          ],
        }}
        onLayout={(event) => {
          onHeight(Math.round(event.nativeEvent.layout.height));
        }}
      >
        <Animated.View style={{ backgroundColor: background }}>
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
                // Cards after the fourth share the last start, so a long list never runs past the end.
                const start = Math.min(index * STEP, 1 - SHARE);
                const range = [start, start + SHARE];
                return (
                  <Animated.View
                    key={id}
                    style={{
                      opacity: progress.interpolate({
                        inputRange: range,
                        outputRange: [0, 1],
                        extrapolate: 'clamp',
                      }),
                      transform: [
                        {
                          translateY: progress.interpolate({
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
        </Animated.View>
      </Animated.View>
    </View>
  );
}
