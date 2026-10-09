import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon } from './Icon';
import { Text } from './Text';
import { radius, space } from './tokens';
import { useReduceMotion } from './useReduceMotion';

/**
 * One page of the insight card. Each page is one idea, so nothing is stacked: what to check when the order arrives,
 * what a helping holds, and a tip with a few small facts.
 */
export type InsightPage =
  | {
      kind: 'check';
      /** The page's name in the strip of tabs, for example "Delivery". */
      tab: string;
      title: string;
      body: string;
    }
  | {
      kind: 'nutrition';
      tab: string;
      /** For example "Nutrition per 250 ml, approx.". */
      caption: string;
      /** The big number: "145" and "kcal". */
      energy: { value: string; unit: string };
      /** Three figures, each with how long its bar is (0 to 1). */
      macros: readonly { label: string; value: string; share: number }[];
    }
  | {
      kind: 'value';
      tab: string;
      /** For example "Price per unit". */
      caption: string;
      /** The big figure: this size's price per litre, kilogram or piece, for example "₹58/L". */
      unit: string;
      /** Every size with its price per unit, so they can be compared. */
      sizes: readonly { label: string; value: string; current: boolean; tag?: string }[];
    }
  | {
      kind: 'tip';
      tab: string;
      title: string;
      text: string;
      /** Small facts under the tip, each a label and a value. */
      extras: readonly { label: string; value: string }[];
    };

export interface ProductInsightProps {
  /** The card's name for a screen reader, for example "Good to know". */
  title: string;
  /** In the order they matter: the first is what the shopper most needs to know. */
  pages: readonly InsightPage[];
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
const BAR = 4;

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
      gap: space[2],
      paddingHorizontal: space[4],
      paddingVertical: space[3] + 2,
      borderRadius: radius.xl,
      backgroundColor: c.overlay,
      overflow: 'hidden',
      // It grows out of the button's corner.
      transformOrigin: 'bottom right',
    },
    // The room for the pages: whatever is left of the card under the tabs.
    pager: { flex: 1 },
    tabs: { flexDirection: 'row', gap: space[4] },
    tab: { paddingBottom: 2, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabOn: { borderBottomColor: c.accent },
    // A fine line under the tabs, then the page.
    rule: { height: 1, backgroundColor: c.onOverlay, opacity: 0.16 },
    page: { gap: space[1] + 2 },
    badge: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    // The badge's soft light disc: the white at low strength, behind the icon.
    disc: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.onOverlay,
      opacity: 0.16,
    },
    energy: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
    macro: { gap: 2 },
    macroHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    track: { height: BAR, borderRadius: radius.full, backgroundColor: c.onOverlay, opacity: 0.18 },
    fillWrap: { position: 'absolute', left: 0, top: 0, bottom: 0 },
    fill: { height: BAR, borderRadius: radius.full, backgroundColor: c.accent },
    extra: { gap: 2 },
    sizeValue: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  });

/** One page's content. */
function PageBody({ page }: { page: InsightPage }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  if (page.kind === 'check') {
    return (
      <View style={styles.page}>
        <View style={styles.badge}>
          <View style={styles.disc} />
          <Icon name="shield" color={colors.accent} size={20} />
        </View>
        <Text variant="strong" color="onOverlay">
          {page.title}
        </Text>
        <Text variant="small" color="onOverlayMuted">
          {page.body}
        </Text>
      </View>
    );
  }

  if (page.kind === 'nutrition') {
    return (
      <View style={styles.page}>
        <Text variant="caption" color="onOverlayMuted">
          {page.caption}
        </Text>
        <View style={styles.energy}>
          <Text variant="title" color="onOverlay">
            {page.energy.value}
          </Text>
          <Text variant="strong" color="onOverlayMuted">
            {page.energy.unit}
          </Text>
        </View>
        {page.macros.map((macro) => (
          <View key={macro.label} style={styles.macro}>
            <View style={styles.macroHead}>
              <Text variant="small" color="onOverlayMuted">
                {macro.label}
              </Text>
              <Text variant="strong" color="onOverlay">
                {macro.value}
              </Text>
            </View>
            <View>
              <View style={styles.track} />
              <View style={[styles.fillWrap, { width: `${Math.round(macro.share * 100)}%` }]}>
                <View style={styles.fill} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (page.kind === 'value') {
    return (
      <View style={styles.page}>
        <Text variant="caption" color="onOverlayMuted">
          {page.caption}
        </Text>
        <Text variant="title" color="onOverlay">
          {page.unit}
        </Text>
        {page.sizes.map((size) => (
          <View key={size.label} style={styles.macroHead}>
            <Text variant="small" color={size.current ? 'onOverlay' : 'onOverlayMuted'}>
              {size.label}
            </Text>
            <View style={styles.sizeValue}>
              {size.tag !== undefined ? (
                <Text variant="caption" color="accent">
                  {size.tag}
                </Text>
              ) : null}
              <Text variant="strong" color="onOverlay">
                {size.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text variant="caption" color="onOverlayMuted">
        {page.title}
      </Text>
      <Text variant="small" color="onOverlay">
        {page.text}
      </Text>
      {page.extras.map((extra) => (
        <View key={extra.label} style={styles.extra}>
          <Text variant="caption" color="onOverlayMuted">
            {extra.label}
          </Text>
          <Text variant="small" color="onOverlay">
            {extra.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** The card itself: a strip of tabs over pages that swipe, one idea on each. It exists only while it is open. */
function InsightCard({
  title,
  pages,
  progress,
  height,
}: {
  title: string;
  pages: readonly InsightPage[];
  progress: Animated.Value;
  /** How tall the card is: the same for every page and every product. */
  height: number;
}) {
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const scroller = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  // The pages' own size, measured once: every page gets exactly this room, so nothing moves when the page changes.
  const [pager, setPager] = useState({ width: 0, height: 0 });
  const { width } = pager;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(Math.max(0, Math.min(pages.length - 1, next)));
  };

  return (
    <Animated.View
      accessible
      role="summary"
      aria-label={`${title}. ${pages.map((page) => page.tab).join(', ')}`}
      style={[
        styles.card,
        {
          height,
          opacity: progress,
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
          ],
        },
      ]}
    >
      {pages.length > 1 ? (
        <View style={styles.tabs} role="tablist">
          {pages.map((page, position) => (
            <Pressable
              key={page.kind}
              role="tab"
              aria-selected={position === index}
              aria-label={page.tab}
              hitSlop={8}
              onPress={() => {
                scroller.current?.scrollTo({ x: position * width, animated: !reduceMotion });
                setIndex(position);
              }}
              style={[styles.tab, position === index && styles.tabOn]}
            >
              <Text
                variant="caption"
                color={position === index ? 'onOverlay' : 'onOverlayMuted'}
                numberOfLines={1}
              >
                {page.tab}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      <View style={styles.rule} aria-hidden />
      <View
        style={styles.pager}
        onLayout={(event) => {
          const { width: w, height: h } = event.nativeEvent.layout;
          setPager({ width: Math.round(w), height: Math.round(h) });
        }}
      >
        {width > 0 ? (
          <ScrollView
            ref={scroller}
            horizontal
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            disableIntervalMomentum
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
          >
            {pages.map((page) => (
              <ScrollView
                key={page.kind}
                style={{ width, height: pager.height }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                <PageBody page={page} />
              </ScrollView>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </Animated.View>
  );
}

/**
 * A sparkle button on the picture that opens a card of what is good to know about the product, and closes it again
 * (the same button turns into a cross). The card is dark glass over the picture and shows one idea at a time: a strip
 * of tabs (Delivery, Nutrition, Tip) over pages that swipe, in the order a shopper needs them, with plenty of
 * room around each. It grows out of the button's corner and fades; with "reduce motion" on it simply appears.
 */
export function ProductInsight({
  title,
  pages,
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
        <InsightCard
          title={title}
          pages={pages}
          progress={progress}
          height={Math.max(0, room - INSET * 2)}
        />
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
