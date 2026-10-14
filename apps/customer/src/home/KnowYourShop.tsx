import { useId, useState, type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, radius, space } from '@/ui';
import { CompareScene } from './CompareScene';
import { KNOW_QUESTIONS, KNOW_SCORE, type KnowQuestionId } from './knowRules';
import { useSampleShops } from './sampleShops';

/** One question card's width, and how much of the next one shows beside it. */
const CARD_MAX = 296;
const CARD_GAP = space[3];
const EDGE = 3;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    module: { paddingBottom: space[4], gap: space[4] },
    // The dark stage under the heading and the scene; its bottom edge fades into the page.
    stage: { paddingTop: space[4], paddingBottom: space[6], gap: space[4] },
    // With the strip above the heading it starts where the strip block did.
    stageLed: { paddingTop: space[3] },
    // Where the stage's colour meets the page's, its top edge is curved, as the washes' are.
    stageRounded: {
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      overflow: 'hidden',
    },
    head: { paddingHorizontal: space[4], gap: space[1] },
    kicker: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    kickerDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: c.accent,
    },
    pad: { paddingHorizontal: space[4] },
    titleRow: {
      paddingHorizontal: space[4],
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: space[2],
    },
    rail: { paddingHorizontal: space[4], gap: CARD_GAP },
    card: {
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
      padding: space[3],
      gap: space[2],
    },
    answer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[3],
      borderRadius: radius.lg,
      paddingHorizontal: space[3],
      paddingVertical: space[2],
    },
    answerDark: { backgroundColor: c.muted },
    answerShop: { backgroundColor: c.accentSubtle },
    answerText: { flex: 1, gap: 2 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
    dot: { height: 6, width: 6, borderRadius: 6, backgroundColor: c.ink, opacity: 0.3 },
    dotOn: { width: 18, opacity: 1 },
    score: { paddingHorizontal: space[4], flexDirection: 'row', gap: space[3] },
    tile: {
      flex: 1,
      alignItems: 'center',
      borderRadius: radius.xl,
      paddingVertical: space[2],
      paddingHorizontal: space[2],
    },
    tileDark: { backgroundColor: c.plum },
    tileShop: {
      backgroundColor: c.accent,
      borderBottomWidth: EDGE,
      borderRightWidth: EDGE,
      borderColor: c.accentEdge,
    },
  });

/**
 * The stage behind the heading and the scene (ADR 0057): the near-black of the mock, held while the heading is read and then fading
 * in one straight line into the page's own colour as the page goes down, so the scene and the cards below sit on the page. `solid`
 * is how far down the stage the dark holds, as a share of its height. It is drawn from theme colours, so it follows both themes.
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

/** One answer under a question: a dark store's (muted, with a cross) or the shop's (pistachio, with a tick). */
function Answer({ kind, label, text }: { kind: 'dark' | 'shop'; label: string; text: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const shop = kind === 'shop';
  return (
    <View style={[styles.answer, shop ? styles.answerShop : styles.answerDark]}>
      <Icon
        name={shop ? 'check' : 'close'}
        color={shop ? colors.accentInk : colors.inkMuted}
        size={22}
      />
      <View style={styles.answerText}>
        <Text variant="caption" color={shop ? 'accentInk' : 'inkMuted'}>
          {label}
        </Text>
        <Text variant="small" color={shop ? 'ink' : 'inkMuted'}>
          {text}
        </Text>
      </View>
    </View>
  );
}

/**
 * "Know your shop" (ADR 0054, ADR 0055 step 4). One idea: a customer can check a shop and cannot check a dark store. A scene to drag
 * opens it, five questions follow as swipeable cards (each answered for a dark store and for a shop), a 0 of 5 against 5 of 5 score
 * sums it up. It is kept compact: the page goes on to the shops' own rows straight after.
 *
 * It names no company and says nothing about anyone's food; it compares only what a customer can check for themselves, and says so.
 * The shop it names in the answers is a real shop from the shop data (name and the year it joined the town). `lead` is drawn at the
 * top of the stage, on the same fade, so what sits above the heading is part of it and not a separate band.
 */
export function KnowYourShop({
  lead,
}: {
  /** Something that belongs at the very top of the stage, on the same fade (Home's payment strip). */
  lead?: ReactNode;
}) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const shops = useSampleShops();
  const { width: screen } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  // How far down the stage the heading ends, so the dark holds until the heading has been read and then fades.
  const [stageHeight, setStageHeight] = useState(0);
  const [headEnd, setHeadEnd] = useState(0);
  const solid =
    stageHeight > 0 ? Math.min(0.7, Math.max(0.2, (headEnd + space[4]) / stageHeight)) : 0.45;
  const shop = shops.find((candidate) => candidate.open) ?? shops[0];
  const cardWidth = Math.min(CARD_MAX, screen - space[4] * 2 - space[6]);
  const step = cardWidth + CARD_GAP;
  const total = KNOW_QUESTIONS.length;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.min(
      total - 1,
      Math.max(0, Math.round(event.nativeEvent.contentOffset.x / step)),
    );
    if (next !== index) setIndex(next);
  };

  const shopAnswer = (id: KnowQuestionId): string => {
    switch (id) {
      case 'where':
        return t('home.know.q.where.shop');
      case 'who':
        return t('home.know.q.who.shop', {
          shop: shop?.name ?? '',
          year: shop?.since ?? '',
        });
      case 'kept':
        return t('home.know.q.kept.shop');
      case 'wrong':
        return t('home.know.q.wrong.shop');
      case 'name':
        return t('home.know.q.name.shop', { shop: shop?.name ?? '' });
    }
  };
  const darkAnswer = (id: KnowQuestionId): string => t(`home.know.q.${id}.dark`);
  const question = (id: KnowQuestionId): string => t(`home.know.q.${id}.title`);

  return (
    <View style={styles.module} aria-label={t('home.know.kicker')}>
      <View
        style={[styles.stage, lead !== undefined && styles.stageLed, styles.stageRounded]}
        onLayout={(event) => {
          setStageHeight(event.nativeEvent.layout.height);
        }}
      >
        <Backdrop solid={solid} />
        {lead}
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
      </View>

      <View style={{ gap: space[3] }}>
        <View style={styles.titleRow}>
          <Text variant="subheading">{t('home.know.fiveTitle')}</Text>
          <Text variant="small" color="inkMuted">
            {t('home.know.count', { n: index + 1, total })}
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          snapToInterval={step}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={32}
        >
          {KNOW_QUESTIONS.map((id, position) => (
            <View
              key={id}
              style={[styles.card, { width: cardWidth }]}
              accessible
              aria-label={`${t('home.know.count', { n: position + 1, total })}. ${question(id)}`}
            >
              <Text variant="caption" color="inkMuted">
                {t('home.know.count', { n: position + 1, total })}
              </Text>
              <Text variant="subheading">{question(id)}</Text>
              <Answer kind="dark" label={t('home.know.darkLabel')} text={darkAnswer(id)} />
              <Answer kind="shop" label={t('home.know.shopLabel')} text={shopAnswer(id)} />
            </View>
          ))}
        </ScrollView>
        <View style={styles.dots} aria-hidden>
          {KNOW_QUESTIONS.map((id, position) => (
            <View key={id} style={[styles.dot, position === index && styles.dotOn]} />
          ))}
        </View>
      </View>

      <View style={{ gap: space[2] }}>
        <View style={styles.score}>
          <View style={[styles.tile, styles.tileDark]}>
            <Text variant="hero" color="onPlum">
              {t('home.know.count', { n: KNOW_SCORE.darkStore, total })}
            </Text>
            <Text variant="strong" color="onPlumMuted" align="center">
              {t('home.know.darkLabel')}
            </Text>
          </View>
          <View style={[styles.tile, styles.tileShop]}>
            <Text variant="hero" color="onAccent">
              {t('home.know.count', { n: KNOW_SCORE.shop, total })}
            </Text>
            <Text variant="strong" color="onAccent" align="center">
              {t('home.know.shopLabel')}
            </Text>
          </View>
        </View>
        <Text variant="small" color="inkMuted" align="center">
          {t('home.know.scoreCaption')}
        </Text>
      </View>
    </View>
  );
}
