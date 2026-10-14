import type { MessageKey } from '@quibo/i18n';
import { useId, useState } from 'react';
import { formatRupees } from '@quibo/contracts';
import {
  Text as NativeText,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Text, radius, space } from '@/ui';
import { useConditions } from './conditions';
import { FREE_DELIVERY_FROM, ZONE } from './delivery';
import { stripChips, type StripChipId } from './stripChips';

const EMOJI: Readonly<Record<StripChipId, string>> = {
  cod: '\u{1F4B5}',
  visited: '\u{2705}',
  free: '\u{1F6F5}',
  upi: '\u{1F4F2}',
};

const WORDS: Readonly<Record<StripChipId, { title: MessageKey; sub: MessageKey }>> = {
  cod: { title: 'home.strip.cod', sub: 'home.strip.codSub' },
  visited: { title: 'home.strip.visited', sub: 'home.strip.visitedSub' },
  free: { title: 'home.strip.free', sub: 'home.strip.freeSub' },
  upi: { title: 'home.strip.upi', sub: 'home.strip.upiSub' },
};

/** The stamped edge under a filled chip, like the price badge's. */
const EDGE = 3;
/** How wide the fade is where chips run off the edge, and how near the end counts as the end. */
const FADE = 28;
const END_SLACK = 4;

/** What the strip sits on, so the fade at its edges melts into it: Home's night stage, or a pistachio wash. */
export type StripGround = 'night' | 'wash';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: space[2],
      paddingHorizontal: space[4],
      paddingRight: space[4] + EDGE,
    },
    chip: {
      minHeight: space[12],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingVertical: space[1],
      paddingLeft: space[1] + 2,
      paddingRight: space[3],
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    filled: {
      borderColor: c.accent,
      backgroundColor: c.accent,
      borderBottomColor: c.accentEdge,
      borderRightColor: c.accentEdge,
      borderBottomWidth: EDGE,
      borderRightWidth: EDGE,
    },
    bubble: {
      width: 32,
      height: 32,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.lilac,
    },
    bubbleFilled: { backgroundColor: c.surface },
    words: { flexShrink: 1 },
    pressed: { opacity: 0.8 },
    fade: { position: 'absolute', top: 0, bottom: 0, width: FADE },
    fadeLeft: { left: 0 },
    fadeRight: { right: 0 },
  });

/** A fade from the ground's colour at the edge to clear toward the middle. It tells the eye the row goes on. */
function EdgeFade({ side, color }: { side: 'left' | 'right'; color: string }) {
  const styles = useStyles(makeStyles);
  const id = `strip-fade-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const left = side === 'left';
  return (
    <View
      pointerEvents="none"
      style={[styles.fade, left ? styles.fadeLeft : styles.fadeRight]}
      aria-hidden
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1={left ? '0' : '1'} y1="0" x2={left ? '1' : '0'} y2="0">
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * The payment and trust strip under Home's mosaic: what a first-time customer wants to know before anything else. Pay on delivery
 * is the one filled chip, with the same stamped edge as the price badge, so it is found at once. The chips are statements, not
 * buttons, except "Visited shops only", which opens "How we check a shop".
 */
export function PaymentStrip({
  onVisitedPress,
  ground,
}: {
  onVisitedPress: () => void;
  ground: StripGround;
}) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const { store } = useConditions();
  // Where the row is, and how wide it and its chips are, so a fade shows on the side that has more to scroll to and each chip
  // snaps to the page's left margin.
  const [offset, setOffset] = useState(0);
  const [viewWidth, setViewWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [starts, setStarts] = useState<Readonly<Record<string, number>>>({});
  const fadeColor = ground === 'night' ? colors.night : colors.accentSubtle;
  const moreLeft = offset > END_SLACK;
  const moreRight = contentWidth - viewWidth - offset > END_SLACK;
  const chips = stripChips({ codMax: ZONE.payment.codMaxNewCustomer, store });

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        aria-label={t('home.strip.label')}
        decelerationRate="fast"
        snapToOffsets={chips.map((id) => Math.max(0, (starts[id] ?? 0) - space[4]))}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          setOffset(event.nativeEvent.contentOffset.x);
        }}
        scrollEventThrottle={32}
        onLayout={(event: LayoutChangeEvent) => {
          setViewWidth(event.nativeEvent.layout.width);
        }}
        onContentSizeChange={(width) => {
          setContentWidth(width);
        }}
      >
        {chips.map((id) => {
          const filled = id === 'cod';
          const words = WORDS[id];
          const sub =
            id === 'free'
              ? t(words.sub, { amount: formatRupees(FREE_DELIVERY_FROM) })
              : t(words.sub);
          const content = (
            <>
              <View style={[styles.bubble, filled && styles.bubbleFilled]} aria-hidden>
                <NativeText allowFontScaling={false} style={{ fontSize: 16, lineHeight: 22 }}>
                  {EMOJI[id]}
                </NativeText>
              </View>
              <View style={styles.words}>
                <Text variant="strong" color={filled ? 'onAccent' : 'ink'} numberOfLines={1}>
                  {t(words.title)}
                </Text>
                <Text variant="fine" color={filled ? 'onAccent' : 'inkMuted'} numberOfLines={1}>
                  {sub}
                </Text>
              </View>
            </>
          );
          if (id === 'visited') {
            return (
              <Pressable
                key={id}
                role="button"
                aria-label={`${t(words.title)}. ${sub}. ${t('home.strip.visitedHint')}`}
                onPress={onVisitedPress}
                onLayout={(event) => {
                  const { x } = event.nativeEvent.layout;
                  setStarts((all) => (all[id] === x ? all : { ...all, [id]: x }));
                }}
                style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
              >
                {content}
              </Pressable>
            );
          }
          return (
            <View
              key={id}
              accessible
              aria-label={`${t(words.title)}. ${sub}`}
              onLayout={(event) => {
                const { x } = event.nativeEvent.layout;
                setStarts((all) => (all[id] === x ? all : { ...all, [id]: x }));
              }}
              style={[styles.chip, filled && styles.filled]}
            >
              {content}
            </View>
          );
        })}
      </ScrollView>
      {moreLeft ? <EdgeFade side="left" color={fadeColor} /> : null}
      {moreRight ? <EdgeFade side="right" color={fadeColor} /> : null}
    </View>
  );
}
