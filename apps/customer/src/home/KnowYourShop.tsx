import { useEffect, useId, useState } from 'react';
import { Animated, Easing, Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, TAP_MIN, radius, space, useReduceMotion } from '@/ui';
import { CompareScene } from './CompareScene';
import { KNOW_QUESTIONS, KNOW_SCORE, type KnowQuestionId } from './knowRules';

const EDGE = 3;
/**
 * The two result columns of the matrix share one block, each taking half of it, so they are always the same width whatever the
 * phone's width or the words in them. The block is half of the card, never narrower than two columns that hold "Connected". The
 * score pills, the store names and the marks all sit in this one block, so every column lines up with the one above it.
 */
const RESULTS_SHARE = '50%';
const RESULTS_MIN = 160;
const MARK = 28;
const ICON_BOX = 24;
/** How long the checks take to open and close. */
const OPEN_MS = 280;

/** What each check looks like in its row: a picture, so the five can be told apart at a glance. */
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
    // The card under the scene: always its one head row (the label and the two scores); the five checks open under it.
    matrix: {
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
      paddingHorizontal: space[3],
      overflow: 'hidden',
    },
    cols: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    headRow: { minHeight: TAP_MIN + space[3], paddingVertical: space[2] },
    side: { flex: 1, minWidth: 0 },
    // The block that holds the two result columns, and each column in it: equal halves.
    results: {
      width: RESULTS_SHARE,
      minWidth: RESULTS_MIN,
      flexShrink: 0,
      flexDirection: 'row',
      gap: space[2],
    },
    result: { flex: 1, flexBasis: 0, minWidth: 0, alignItems: 'center' },
    headLabel: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space[1] },
    score: {
      flex: 1,
      flexBasis: 0,
      minWidth: 0,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      // Both pills carry the same stamped edge, so they are the same size; the dark one's edge is its own colour.
      borderBottomWidth: EDGE,
      borderRightWidth: EDGE,
    },
    scoreDark: { backgroundColor: c.plum, borderColor: c.plum },
    scoreShop: { backgroundColor: c.accent, borderColor: c.accentEdge },
    // The five checks, which grow open under the head row.
    body: { overflow: 'hidden' },
    bodyInner: { position: 'absolute', left: 0, right: 0, top: 0, paddingBottom: space[2] },
    names: { paddingBottom: space[1] },
    row: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      borderTopWidth: 1,
      borderTopColor: c.line,
      paddingVertical: space[1],
    },
    label: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
    iconBox: { width: ICON_BOX, alignItems: 'center' },
    mark: {
      width: MARK,
      height: MARK,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markNo: { backgroundColor: c.muted },
    markYes: { backgroundColor: c.accent },
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

/** A cross (a dark store cannot be checked) or a tick (a connected store can), in a small circle. */
function Mark({ yes }: { yes: boolean }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <View style={[styles.mark, yes ? styles.markYes : styles.markNo]} aria-hidden>
      <Icon
        name={yes ? 'check' : 'close'}
        color={yes ? colors.onAccent : colors.inkMuted}
        size={16}
      />
    </View>
  );
}

/**
 * "Know your shop" (ADR 0054, ADR 0055 step 4). One idea: a customer can check a shop and cannot check a dark store. The heading and
 * the scene to drag open it. Under the scene there is one small card: a row that says "Things you can check yourself" with the
 * 0 of 5 against 5 of 5 score, always in view. A tap opens the five checks under it, smoothly: each with its picture, a cross for a
 * Dark Store and a tick for a Connected Store, in two columns that line up with the two scores.
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
          <View style={styles.matrix}>
            <Pressable
              role="button"
              aria-expanded={open}
              aria-label={`${t('home.know.scoreCaption')}. ${t('home.know.darkLabel')}: ${scoreOf(KNOW_SCORE.darkStore)}. ${t('home.know.shopLabel')}: ${scoreOf(KNOW_SCORE.shop)}`}
              onPress={() => {
                setOpen((was) => !was);
              }}
              style={({ pressed }) => [styles.cols, styles.headRow, pressed && styles.pressed]}
            >
              <View style={styles.headLabel}>
                <View style={styles.side}>
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
              </View>
              <View style={styles.results}>
                <View style={[styles.score, styles.scoreDark]}>
                  <Text variant="strong" color="onPlum">
                    {scoreOf(KNOW_SCORE.darkStore)}
                  </Text>
                </View>
                <View style={[styles.score, styles.scoreShop]}>
                  <Text variant="strong" color="onAccent">
                    {scoreOf(KNOW_SCORE.shop)}
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* The five checks. Measured once, then the height runs between nothing and that, with the opacity. */}
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
                {/* Which column is which, over the marks. */}
                <View style={[styles.cols, styles.names]}>
                  <View style={styles.side} />
                  <View style={styles.results}>
                    <View style={styles.result}>
                      <Text variant="strong" align="center" tight>
                        {t('home.know.darkLabel')}
                      </Text>
                    </View>
                    <View style={styles.result}>
                      <Text variant="strong" align="center" tight>
                        {t('home.know.shopLabel')}
                      </Text>
                    </View>
                  </View>
                </View>
                {KNOW_QUESTIONS.map((id) => (
                  <View
                    key={id}
                    style={styles.row}
                    accessible
                    aria-label={`${question(id)}. ${t('home.know.darkLabel')}: ${t('home.know.cannot')}. ${t('home.know.shopLabel')}: ${t('home.know.can')}`}
                  >
                    <View style={styles.label}>
                      <View style={styles.iconBox}>
                        <NativeText
                          allowFontScaling={false}
                          aria-hidden
                          style={{ fontSize: 20, lineHeight: 26 }}
                        >
                          {ICON[id]}
                        </NativeText>
                      </View>
                      <View style={styles.side}>
                        <Text variant="strong" tight>
                          {question(id)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.results}>
                      <View style={styles.result}>
                        <Mark yes={false} />
                      </View>
                      <View style={styles.result}>
                        <Mark yes />
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
