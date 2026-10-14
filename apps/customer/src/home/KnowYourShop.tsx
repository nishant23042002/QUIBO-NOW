import { useId, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, TAP_MIN, radius, space } from '@/ui';
import { CompareScene } from './CompareScene';
import { KNOW_QUESTIONS, KNOW_ROWS_COLLAPSED, KNOW_SCORE, type KnowQuestionId } from './knowRules';
import { useSampleShops } from './sampleShops';

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
    // The comparison: one card, the two kinds of place as two columns, every row answered side by side.
    table: {
      marginHorizontal: space[4],
      padding: space[2],
      gap: space[2],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    cols: { flexDirection: 'row', gap: space[2] },
    colHead: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      borderRadius: radius.lg,
      paddingHorizontal: space[2],
      paddingVertical: space[2],
    },
    headDark: { backgroundColor: c.plum },
    headShop: { backgroundColor: c.accent },
    headText: { flex: 1, minWidth: 0 },
    row: {
      gap: space[2],
      paddingTop: space[2],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    cell: {
      flex: 1,
      minWidth: 0,
      borderRadius: radius.lg,
      paddingHorizontal: space[2],
      paddingVertical: space[2],
    },
    more: {
      minHeight: TAP_MIN,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[1],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    pressed: { opacity: 0.85 },
    cellDark: { backgroundColor: c.muted },
    cellShop: { backgroundColor: c.accentSubtle },
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

/** One column's heading: the kind of place, with a cross (a dark store, in aubergine) or a tick (a connected store, in pistachio). */
function ColumnHead({ kind, label }: { kind: 'dark' | 'shop'; label: string }) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const shop = kind === 'shop';
  const ink = shop ? colors.onAccent : colors.onPlum;
  return (
    <View style={[styles.colHead, shop ? styles.headShop : styles.headDark]}>
      <Icon name={shop ? 'check' : 'close'} color={ink} size={20} />
      <View style={styles.headText}>
        <Text variant="label" color={shop ? 'onAccent' : 'onPlum'}>
          {label}
        </Text>
      </View>
    </View>
  );
}

/** One answer in a column: a dark store's (muted) or a connected store's (pistachio). */
function Cell({ kind, text }: { kind: 'dark' | 'shop'; text: string }) {
  const styles = useStyles(makeStyles);
  const shop = kind === 'shop';
  return (
    <View style={[styles.cell, shop ? styles.cellShop : styles.cellDark]}>
      <Text variant="small" color={shop ? 'ink' : 'inkMuted'}>
        {text}
      </Text>
    </View>
  );
}

/**
 * "Dark Store vs Connected Store" (ADR 0054, ADR 0055 step 4). One idea: a customer can check a shop and cannot check a dark store.
 * A scene to drag opens it, then one comparison with the two kinds of place side by side, five things a customer can check each
 * answered in its own column, and a 0 of 5 against 5 of 5 score at the foot. Everything is on screen at once, nothing to swipe.
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
  // How far down the stage the heading ends, so the dark holds until the heading has been read and then fades.
  const [stageHeight, setStageHeight] = useState(0);
  const [headEnd, setHeadEnd] = useState(0);
  const solid =
    stageHeight > 0 ? Math.min(0.7, Math.max(0.2, (headEnd + space[4]) / stageHeight)) : 0.45;
  const shop = shops.find((candidate) => candidate.open) ?? shops[0];
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const total = KNOW_QUESTIONS.length;
  const rows = open ? KNOW_QUESTIONS : KNOW_QUESTIONS.slice(0, KNOW_ROWS_COLLAPSED);

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
        <View style={styles.pad}>
          <Text variant="subheading" role="heading">
            {t('home.know.compareTitle')}
          </Text>
        </View>
        <View style={styles.table}>
          <View style={styles.cols}>
            <ColumnHead kind="dark" label={t('home.know.darkLabel')} />
            <ColumnHead kind="shop" label={t('home.know.shopLabel')} />
          </View>
          {rows.map((id) => (
            <View
              key={id}
              style={styles.row}
              accessible
              aria-label={`${question(id)}. ${t('home.know.darkLabel')}: ${darkAnswer(id)}. ${t('home.know.shopLabel')}: ${shopAnswer(id)}`}
            >
              <Text variant="strong">{question(id)}</Text>
              <View style={styles.cols}>
                <Cell kind="dark" text={darkAnswer(id)} />
                <Cell kind="shop" text={shopAnswer(id)} />
              </View>
            </View>
          ))}
          <Pressable
            role="button"
            aria-expanded={open}
            aria-label={open ? t('home.know.less') : t('home.know.more')}
            onPress={() => {
              setOpen((was) => !was);
            }}
            style={({ pressed }) => [styles.more, pressed && styles.pressed]}
          >
            <Text variant="strong" color="action">
              {open ? t('home.know.less') : t('home.know.more')}
            </Text>
            <View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}>
              <Icon name="chevronRight" color={colors.action} size={18} />
            </View>
          </Pressable>
          <View
            style={styles.row}
            accessible
            aria-label={`${t('home.know.scoreCaption')}. ${t('home.know.darkLabel')}: ${t('home.know.count', { n: KNOW_SCORE.darkStore, total })}. ${t('home.know.shopLabel')}: ${t('home.know.count', { n: KNOW_SCORE.shop, total })}`}
          >
            <Text variant="strong">{t('home.know.scoreCaption')}</Text>
            <View style={styles.cols}>
              <View style={[styles.tile, styles.tileDark]}>
                <Text variant="hero" color="onPlum">
                  {t('home.know.count', { n: KNOW_SCORE.darkStore, total })}
                </Text>
              </View>
              <View style={[styles.tile, styles.tileShop]}>
                <Text variant="hero" color="onAccent">
                  {t('home.know.count', { n: KNOW_SCORE.shop, total })}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
