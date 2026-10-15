import { useEffect, useId, useState } from 'react';
import { Animated, Easing, Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, TAP_MIN, radius, space, useReduceMotion } from '@/ui';
import { CompareScene } from './CompareScene';
import { KNOW_QUESTIONS, KNOW_SCORE, type KnowQuestionId } from './knowRules';

const EDGE = 3;
/** The circle that holds a cross or a tick. */
const MARK = 28;
/** How long the checks take to open and close. */
const OPEN_MS = 280;

/** What each check looks like: a picture, so the five can be told apart at a glance. */
const ICON: Readonly<Record<KnowQuestionId, string>> = {
  where: '\u{1F3EA}',
  who: '\u{1F464}',
  kept: '\u{1F9FA}',
  wrong: '\u{1F91D}',
  name: '\u{1F3F7}\u{FE0F}',
};

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    module: { paddingBottom: space[4] },
    // The dark stage under the heading and the scene; its bottom edge fades into the page.
    stage: { paddingTop: space[4], paddingBottom: space[6], gap: space[4] },
    // Where the stage's colour meets the page's, its top edge is curved, as the washes' are.
    stageRounded: {
      borderTopLeftRadius: radius.section,
      borderTopRightRadius: radius.section,
      overflow: 'hidden',
    },
    head: { paddingHorizontal: space[4], gap: space[1] },
    kicker: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    kickerDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: c.accent },
    pad: { paddingHorizontal: space[4] },
    // The card under the scene: the two kinds of store side by side with their score (always in view), and, opening under them,
    // the five checks compared.
    card: {
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
      paddingHorizontal: space[3],
      overflow: 'hidden',
    },
    titleRow: {
      minHeight: TAP_MIN,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
      paddingVertical: space[1],
    },
    title: { flex: 1, minWidth: 0 },
    // The two stores: equal halves, each one name and one score, the colours of the scene above.
    stores: { flexDirection: 'row', gap: space[2], paddingBottom: space[3] },
    store: {
      flex: 1,
      flexBasis: 0,
      minWidth: 0,
      alignItems: 'center',
      gap: 2,
      borderRadius: radius.lg,
      paddingVertical: space[2],
      paddingHorizontal: space[2],
      // Both carry the same stamped edge, so they are the same size; the dark one's edge is its own colour.
      borderBottomWidth: EDGE,
      borderRightWidth: EDGE,
    },
    storeDark: { backgroundColor: c.plum, borderColor: c.plum },
    storeShop: { backgroundColor: c.accent, borderColor: c.accentEdge },
    // The five comparisons, which grow open under the stores.
    body: { overflow: 'hidden' },
    bodyInner: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      paddingBottom: space[2],
    },
    // One check per row, read from left to right: a cross (a Dark Store), what is checked, a tick (a Connected Store). The cross and
    // the tick sit at the two outer edges, under the two stores they belong to, in those stores' colours.
    row: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    markCell: { width: MARK + space[2], alignItems: 'center' },
    mark: {
      width: MARK,
      height: MARK,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markNo: { backgroundColor: c.plum },
    markYes: { backgroundColor: c.accent },
    rowLabel: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[2],
      paddingVertical: space[1],
    },
    rowText: { flexShrink: 1 },
    pressed: { opacity: 0.85 },
  });

/**
 * The stage behind the heading and the scene (ADR 0057): the near-black of the mock, held while the heading is read and then fading
 * in one straight line into the page's own colour as the page goes down. `solid` is how far down the stage the dark holds, as a
 * share of its height. It is drawn from theme colours, so it follows both themes.
 */
function Backdrop({ solid }: { solid: number }) {
  const { colors } = useTheme();
  const id = `know-backdrop-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} aria-hidden>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.night} />
            <Stop offset={solid} stopColor={colors.night} />
            <Stop offset="1" stopColor={colors.bg} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * "Know your shop" (ADR 0054, ADR 0055 step 4). One idea: a customer can check a shop and cannot check a dark store. The heading and
 * the scene to drag open it. Under the scene there is one small card in two parts. The first says it at a glance: the two kinds of
 * store side by side, a name and a score each (0 of 5 against 5 of 5), always in view. The second opens with a tap on the title,
 * smoothly: the five checks as rows, each read left to right as a cross (a Dark Store), what is checked, and a tick (a Connected
 * Store), the cross and the tick at the two outer edges under the store each belongs to.
 *
 * It names no company and says nothing about anyone's food; it compares only what a customer can check for themselves.
 */
export function KnowYourShop() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const reduceMotion = useReduceMotion();
  const [open, setOpen] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));
  // How far down the stage the heading ends, so the dark holds until the heading has been read and then fades.
  const [stageHeight, setStageHeight] = useState(0);
  const [headEnd, setHeadEnd] = useState(0);
  const solid =
    stageHeight > 0 ? Math.min(0.7, Math.max(0.15, (headEnd + space[4]) / stageHeight)) : 0.4;
  const total = KNOW_QUESTIONS.length;

  useEffect(() => {
    const move = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: reduceMotion ? 0 : OPEN_MS,
      easing: Easing.out(Easing.cubic),
      // The height changes layout, so it cannot run on the native driver.
      useNativeDriver: false,
    });
    move.start();
    return () => {
      move.stop();
    };
  }, [open, reduceMotion, progress]);

  const scoreOf = (n: number): string => t('home.know.count', { n, total });
  const question = (id: KnowQuestionId): string => t(`home.know.q.${id}.title`);

  return (
    <View style={styles.module} aria-label={t('home.know.kicker')}>
      <View
        style={[styles.stage, styles.stageRounded]}
        onLayout={(event) => {
          setStageHeight(event.nativeEvent.layout.height);
        }}
      >
        <Backdrop solid={solid} />
        <View
          style={styles.head}
          onLayout={(event) => {
            setHeadEnd(event.nativeEvent.layout.y + event.nativeEvent.layout.height);
          }}
        >
          <View style={styles.kicker}>
            <View style={styles.kickerDot} aria-hidden />
            <Text variant="caption" color="accent">
              {t('home.know.kicker')}
            </Text>
          </View>
          <Text variant="hero" color="onNight" role="heading">
            {t('home.know.titleStart')}
            <Text variant="hero" color="accent">
              {t('home.know.titleEm')}
            </Text>
            {t('home.know.titleEnd')}
          </Text>
          <Text variant="small" color="onNightMuted">
            {t('home.know.intro')}
          </Text>
        </View>

        <View style={styles.pad}>
          <CompareScene
            labels={{
              scene: t('home.know.scene.label'),
              hint: t('home.know.scene.hint'),
              darkName: t('home.know.scene.darkName'),
              darkSub: t('home.know.scene.darkSub'),
              tape: t('home.know.scene.tape'),
              shopName: t('home.know.scene.shopName'),
              shopSub: t('home.know.scene.shopSub'),
              open: t('home.know.scene.open'),
            }}
          />
        </View>

        <View style={styles.pad}>
          <View style={styles.card}>
            <Pressable
              role="button"
              aria-expanded={open}
              aria-label={`${t('home.know.scoreCaption')}. ${t('home.know.darkLabel')}: ${scoreOf(KNOW_SCORE.darkStore)}. ${t('home.know.shopLabel')}: ${scoreOf(KNOW_SCORE.shop)}`}
              onPress={() => {
                setOpen((was) => !was);
              }}
              style={({ pressed }) => [styles.titleRow, pressed && styles.pressed]}
            >
              <View style={styles.title}>
                <Text variant="strong" tight>
                  {t('home.know.scoreCaption')}
                </Text>
              </View>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['90deg', '-90deg'],
                      }),
                    },
                  ],
                }}
                aria-hidden
              >
                <Icon name="chevronRight" color={colors.accentInk} size={18} />
              </Animated.View>
            </Pressable>

            {/* The two kinds of store, side by side, each a name and its score. */}
            <View style={styles.stores}>
              <View style={[styles.store, styles.storeDark]}>
                <Text variant="strong" color="onPlum" align="center" numberOfLines={1}>
                  {t('home.know.darkLabel')}
                </Text>
                <Text variant="subheading" color="onPlum" align="center" numberOfLines={1}>
                  {scoreOf(KNOW_SCORE.darkStore)}
                </Text>
              </View>
              <View style={[styles.store, styles.storeShop]}>
                <Text variant="strong" color="onAccent" align="center" numberOfLines={1}>
                  {t('home.know.shopLabel')}
                </Text>
                <Text variant="subheading" color="onAccent" align="center" numberOfLines={1}>
                  {scoreOf(KNOW_SCORE.shop)}
                </Text>
              </View>
            </View>

            {/* The five checks, compared. Measured once, then the height runs between nothing and that, with the opacity. */}
            <Animated.View
              style={[
                styles.body,
                {
                  height: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, bodyHeight],
                  }),
                  opacity: progress,
                },
              ]}
              aria-hidden={!open}
              pointerEvents={open ? 'auto' : 'none'}
            >
              <View
                style={styles.bodyInner}
                onLayout={(event) => {
                  setBodyHeight(event.nativeEvent.layout.height);
                }}
              >
                {KNOW_QUESTIONS.map((id) => (
                  <View
                    key={id}
                    style={styles.row}
                    accessible
                    aria-label={`${question(id)}. ${t('home.know.darkLabel')}: ${t('home.know.cannot')}. ${t('home.know.shopLabel')}: ${t('home.know.can')}`}
                  >
                    <View style={styles.markCell} aria-hidden>
                      <View style={[styles.mark, styles.markNo]}>
                        <Icon name="close" color={colors.onPlum} size={16} />
                      </View>
                    </View>
                    <View style={styles.rowLabel}>
                      <NativeText
                        allowFontScaling={false}
                        aria-hidden
                        style={{ fontSize: 18, lineHeight: 24 }}
                      >
                        {ICON[id]}
                      </NativeText>
                      <View style={styles.rowText}>
                        <Text variant="strong" tight align="center">
                          {question(id)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.markCell} aria-hidden>
                      <View style={[styles.mark, styles.markYes]}>
                        <Icon name="check" color={colors.onAccent} size={16} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
}
