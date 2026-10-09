import { formatRupees, money } from '@quibo/contracts';
import type { MessageKey } from '@quibo/i18n';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Text as NativeText,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  Badge,
  Button,
  Chip,
  Icon,
  Input,
  PopOnChange,
  Segmented,
  Text,
  TrustTiles,
  radius,
  space,
  useReduceMotion,
  type IconName,
} from '@/ui';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';
import { INSTRUCTIONS, NOTE_MAX, type InstructionKey } from './instructions';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { useHomeItems } from './items';
import { licenceOf } from './sampleShops';
import { suggestItems } from './suggestions';
import { SUBSTITUTE_CHOICES, type SubstituteChoice } from './substitution';
import { isPreset, parseTip } from './tip';

const INSTRUCTION_TEXT: Readonly<Record<InstructionKey, MessageKey>> = {
  security: 'extras.security',
  leaveAtDoor: 'extras.leaveAtDoor',
  noBell: 'extras.noBell',
  callOnArrival: 'extras.callOnArrival',
  pets: 'extras.pets',
};

const INSTRUCTION_ICON: Readonly<Record<InstructionKey, IconName>> = {
  security: 'shieldUser',
  leaveAtDoor: 'home',
  noBell: 'bellOff',
  callOnArrival: 'phone',
  pets: 'paw',
};

const SUBSTITUTE_TEXT: Readonly<Record<SubstituteChoice, { label: MessageKey; help: MessageKey }>> =
  {
    swap: { label: 'substitute.swap', help: 'substitute.swapHelp' },
    remove: { label: 'substitute.remove', help: 'substitute.removeHelp' },
    call: { label: 'substitute.call', help: 'substitute.callHelp' },
  };

/** The rider on a scooter, a stand-in for an illustration until the brand has one. */
const RIDER = '\u{1F6F5}';

/** How wide one instruction tile is, so about two and a half show and the row plainly scrolls. */
const TILE = 112;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    card: {
      overflow: 'hidden',
      gap: space[4],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    intro: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    introText: { flex: 1, minWidth: 0, gap: space[1] },
    // A heading with a line under it, on its own row of the card (not beside a picture), so it takes the height of its text.
    heading: { gap: space[1] },
    picture: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      backgroundColor: c.accentSubtle,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    custom: { gap: space[3] },
    thanks: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
    },
    thanksText: { flex: 1, minWidth: 0 },
    link: { minHeight: 36, justifyContent: 'center' },
    // The instruction tiles run out to the card's edges, so they plainly slide sideways.
    tilesBleed: { marginHorizontal: -space[4] },
    tiles: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[4] },
    // Everything in a tile sits on its centre line: the picture over the words, both centred.
    tile: {
      width: TILE,
      minHeight: 104,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[2],
      paddingHorizontal: space[3],
      paddingVertical: space[4],
      borderWidth: 1.5,
      borderRadius: radius.lg,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    tileOn: { borderColor: c.accentEdge, backgroundColor: c.accentSubtle },
    tick: {
      position: 'absolute',
      top: space[2],
      right: space[2],
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.accent,
    },
    note: { gap: space[3] },
    noteCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.md,
      backgroundColor: c.accentSubtle,
    },
    noteText: { flex: 1, minWidth: 0, gap: space[1] },
    noteActions: { flexDirection: 'row', gap: space[4] },
    // Things put aside for later: a list with a line between rows.
    plain: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    sectionHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[2],
      paddingHorizontal: space[4],
      paddingTop: space[4],
      paddingBottom: space[2],
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    rowDivided: { borderTopWidth: 1, borderTopColor: c.line },
    rowThumb: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
    },
    rowText: { flex: 1, minWidth: 0 },
    move: {
      alignSelf: 'flex-start',
      marginTop: space[2],
      minHeight: 36,
      paddingHorizontal: space[3],
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.action,
    },
    discard: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    shield: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      backgroundColor: c.accentSubtle,
    },
    // "If something is unavailable": the way into the per-item choices, and one row for each item.
    expand: {
      alignSelf: 'flex-start',
      minHeight: 36,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[1],
    },
    choiceRow: {
      gap: space[2],
      paddingTop: space[3],
      borderTopWidth: 1,
      borderTopColor: c.line,
    },
    promises: { gap: space[3] },
    rail: { gap: space[3] },
    railRow: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[3] },
  });

/**
 * One quick choice for the rider as a square tile with a picture of its own: a modern outline icon above, the words below.
 * Picking it turns the tile pistachio, the icon and words go green and a small tick appears (so the choice is never shown by
 * colour alone), and the tile gives a little pop.
 */
function InstructionTile({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: IconName;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const [scale] = useState(() => new Animated.Value(1));
  const was = useRef(selected);

  useEffect(() => {
    const before = was.current;
    was.current = selected;
    if (!selected || before || reduceMotion) return undefined;
    scale.setValue(0.92);
    const spring = Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 220,
      useNativeDriver: true,
    });
    spring.start();
    return () => {
      spring.stop();
    };
  }, [selected, reduceMotion, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        role="checkbox"
        aria-checked={selected}
        aria-label={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.tile,
          selected && styles.tileOn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Icon name={icon} color={selected ? colors.accentInk : colors.ink} size={32} light />
        <Text variant="caption" color={selected ? 'accentInk' : 'ink'} align="center">
          {label}
        </Text>
        {selected ? (
          <View style={styles.tick} aria-hidden>
            <Icon name="check" color={colors.onAccent} size={12} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

/**
 * One card with two views, chosen by a small switch. "Tip": a few ready-made amounts and "Other", nothing chosen to begin
 * with; tapping the chosen one again, or "Remove tip", takes it away, and a thank-you line says where it goes (all of it to the
 * rider). "Instructions": a row of tiles to slide through (leave with security, at the door, don't ring the bell, call on
 * arrival, beware of pets), and a note for the rider that is saved with a button and then shown back, with a way to edit or
 * remove it. Both are kept on the phone for next time, and the switch says how many instructions are set even when it
 * shows the tip.
 */
export function TipAndNotes() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { tip, instructions } = useCart();
  const [view, setView] = useState<'tip' | 'notes'>('tip');
  const [customOpen, setCustomOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | undefined>();
  // The note being written, until it is saved; a saved note is shown back instead.
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);

  const custom = tip.amount > 0 && !isPreset(tip.amount, tip.options);
  const maxLabel = formatRupees(tip.max);
  const writing = instructions.note === '' || editing;
  const setCount = instructions.chips.length + (instructions.note === '' ? 0 : 1);

  const addCustom = () => {
    const parsed = parseTip(typed, tip.max);
    if (parsed === undefined) {
      setError(t('extras.tipInvalid', { max: maxLabel }));
      return;
    }
    tip.set(parsed);
    setCustomOpen(false);
    setError(undefined);
  };

  const openCustom = () => {
    if (customOpen) {
      setCustomOpen(false);
      return;
    }
    setTyped(custom ? String(Math.round(tip.amount / 100)) : '');
    setError(undefined);
    setCustomOpen(true);
  };

  const saveNote = () => {
    const text = draft.trim();
    if (text === '') return;
    instructions.setNote(text);
    setEditing(false);
  };

  return (
    <View style={styles.card}>
      <Segmented
        options={[
          { key: 'tip', label: t('extras.tabTip') },
          {
            key: 'notes',
            label: setCount > 0 ? `${t('extras.tabNotes')} · ${setCount}` : t('extras.tabNotes'),
          },
        ]}
        value={view}
        onChange={(key) => {
          setView(key === 'notes' ? 'notes' : 'tip');
        }}
      />
      {view === 'tip' ? (
        <>
          <View style={styles.intro}>
            <View style={styles.introText}>
              <Text variant="label">{t('extras.tipTitle')}</Text>
              <Text variant="small" color="inkMuted">
                {t('extras.tipBody')}
              </Text>
            </View>
            <View style={styles.picture} aria-hidden>
              <NativeText allowFontScaling={false} style={{ fontSize: 30, lineHeight: 38 }}>
                {RIDER}
              </NativeText>
            </View>
          </View>
          <View style={styles.chips}>
            {tip.options.map((option) => (
              <Chip
                key={option}
                label={formatRupees(option)}
                selected={tip.amount === option}
                onPress={() => {
                  setCustomOpen(false);
                  tip.set(tip.amount === option ? money(0) : option);
                }}
              />
            ))}
            <Chip
              label={custom ? formatRupees(tip.amount) : t('extras.tipOther')}
              selected={custom || customOpen}
              onPress={openCustom}
            />
          </View>
          {customOpen ? (
            <View style={styles.custom}>
              <Input
                label={t('extras.tipInputLabel')}
                hint={t('extras.tipInputHint', { max: maxLabel })}
                value={typed}
                onChangeText={(next) => {
                  setTyped(next.replace(/[^0-9]/g, ''));
                  setError(undefined);
                }}
                error={error}
                keyboardType="number-pad"
                maxLength={3}
                returnKeyType="done"
                onSubmitEditing={addCustom}
              />
              <Button
                label={t('extras.tipAdd')}
                disabled={typed.trim() === ''}
                onPress={addCustom}
              />
            </View>
          ) : null}
          {tip.amount > 0 ? (
            <View style={styles.thanks}>
              <View style={styles.thanksText}>
                <PopOnChange value={tip.amount}>
                  <Text variant="strong" color="success">
                    {t('extras.tipThanks', { amount: formatRupees(tip.amount) })}
                  </Text>
                </PopOnChange>
              </View>
              <Pressable
                role="button"
                hitSlop={6}
                onPress={() => {
                  tip.set(money(0));
                  setCustomOpen(false);
                }}
                style={styles.link}
              >
                <Text variant="strong" color="accentInk">
                  {t('extras.tipRemove')}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.heading}>
            <Text variant="label">{t('extras.notesTitle')}</Text>
            <Text variant="small" color="inkMuted">
              {t('extras.notesBody')}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tilesBleed}
            contentContainerStyle={styles.tiles}
          >
            {INSTRUCTIONS.map((key) => (
              <InstructionTile
                key={key}
                icon={INSTRUCTION_ICON[key]}
                label={t(INSTRUCTION_TEXT[key])}
                selected={instructions.chips.includes(key)}
                onPress={() => {
                  instructions.toggle(key);
                }}
              />
            ))}
          </ScrollView>
          {writing ? (
            <View style={styles.note}>
              <Input
                label={t('extras.noteLabel')}
                placeholder={t('extras.notePlaceholder')}
                hint={t('extras.noteCount', { count: draft.length, max: NOTE_MAX })}
                value={draft}
                onChangeText={setDraft}
                maxLength={NOTE_MAX}
                returnKeyType="done"
                onSubmitEditing={saveNote}
              />
              <Button
                label={t('extras.saveNote')}
                disabled={draft.trim() === ''}
                onPress={saveNote}
              />
            </View>
          ) : (
            <View style={styles.note}>
              <Text variant="label">{t('extras.noteLabel')}</Text>
              <PopOnChange value={instructions.note} stretch>
                <View style={styles.noteCard}>
                  <Icon name="check" color={colors.accentInk} size={20} />
                  <View style={styles.noteText}>
                    <Text variant="strong" color="accentInk">
                      {t('extras.noteSaved')}
                    </Text>
                    <Text variant="small">{instructions.note}</Text>
                  </View>
                </View>
              </PopOnChange>
              <View style={styles.noteActions}>
                <Pressable
                  role="button"
                  hitSlop={6}
                  onPress={() => {
                    setDraft(instructions.note);
                    setEditing(true);
                  }}
                  style={styles.link}
                >
                  <Text variant="strong" color="accentInk">
                    {t('extras.editNote')}
                  </Text>
                </Pressable>
                <Pressable
                  role="button"
                  hitSlop={6}
                  onPress={() => {
                    instructions.setNote('');
                    setDraft('');
                    setEditing(false);
                  }}
                  style={styles.link}
                >
                  <Text variant="strong" color="accentInk">
                    {t('extras.removeNote')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

/**
 * "If something is unavailable": shops sometimes run out, so the shopper says in advance what should happen: swap it for the
 * closest match (never at a higher price), leave it out and refund it, or call first. One choice covers the whole order, and
 * "Choose for each item" opens a row per item to give any of them a choice of its own. Kept on the phone.
 */
export function SubstitutionCard() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const { items, count, substitution } = useCart();
  const [perItem, setPerItem] = useState(false);
  if (count === 0) return null;

  const own = items.filter((line) => substitution.choiceFor(line.id) !== substitution.fallback);

  const toggle = () => {
    if (!reduceMotion)
      LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setPerItem((open) => !open);
  };

  return (
    <View style={styles.card}>
      <View style={styles.intro}>
        <View style={styles.introText}>
          <Text variant="label" role="heading">
            {t('substitute.title')}
          </Text>
          <Text variant="small" color="inkMuted">
            {t('substitute.body')}
          </Text>
        </View>
        <View style={styles.shield} aria-hidden>
          <Icon name="repeat" color={colors.accentInk} size={18} />
        </View>
      </View>
      <Segmented
        options={SUBSTITUTE_CHOICES.map((choice) => ({
          key: choice,
          label: t(SUBSTITUTE_TEXT[choice].label),
        }))}
        value={substitution.fallback}
        onChange={(key) => {
          const choice = SUBSTITUTE_CHOICES.find((candidate) => candidate === key);
          if (choice !== undefined) substitution.setFallback(choice);
        }}
      />
      <Text variant="small" color="inkMuted">
        {t(SUBSTITUTE_TEXT[substitution.fallback].help)}
      </Text>
      <Pressable
        role="button"
        aria-expanded={perItem}
        hitSlop={6}
        onPress={toggle}
        style={styles.expand}
      >
        <Text variant="strong" color="accentInk">
          {t(perItem ? 'substitute.sameForAll' : 'substitute.perItem')}
        </Text>
        <View style={{ transform: [{ rotate: perItem ? '-90deg' : '90deg' }] }}>
          <Icon name="chevronRight" color={colors.accentInk} size={16} />
        </View>
      </Pressable>
      {!perItem && own.length > 0 ? (
        <Text variant="small" color="accentInk">
          {t('substitute.customised')}
        </Text>
      ) : null}
      {perItem
        ? items.map((line) => (
            <View
              key={line.id}
              style={styles.choiceRow}
              role="radiogroup"
              aria-label={t('substitute.itemLabel', { name: line.name })}
            >
              <Text variant="strong" numberOfLines={1}>
                {line.name}
              </Text>
              <View style={styles.chips}>
                {SUBSTITUTE_CHOICES.map((choice) => (
                  <Chip
                    key={choice}
                    label={t(SUBSTITUTE_TEXT[choice].label)}
                    selected={substitution.choiceFor(line.id) === choice}
                    onPress={() => {
                      substitution.setFor(line.id, choice);
                    }}
                  />
                ))}
              </View>
            </View>
          ))
        : null}
    </View>
  );
}

/**
 * "You might also like": a row of items that go with what is in the cart, each with its own ADD. The row is chosen once
 * when the cart is first seen and then kept, so an item added from it stays put (and shows its stepper) instead of
 * vanishing from under the shopper's thumb; it is chosen afresh the next time the cart is filled.
 */
export function AlsoLike() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const cart = useCart();
  const catalogue = useHomeItems();
  const [chosen, setChosen] = useState<readonly string[] | null>(null);

  if (cart.ready && cart.count > 0 && chosen === null) {
    const inCart = catalogue.filter((item) =>
      item.packs.some((pack) => (cart.quantities[pack.id] ?? 0) > 0),
    );
    setChosen(
      suggestItems(
        inCart,
        catalogue.map((item) => ({
          id: item.id,
          category: item.category,
          soldOut: item.stock?.kind === 'out',
        })),
      ),
    );
  }
  if (cart.count === 0 && chosen !== null) setChosen(null);

  const items = (chosen ?? [])
    .map((id) => catalogue.find((item) => item.id === id))
    .filter((item) => item !== undefined);
  if (items.length === 0) return null;

  return (
    <View style={styles.rail}>
      <Text variant="subheading" role="heading">
        {t('extras.alsoTitle')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // The row runs out to both edges of the screen, though the page around it is inset.
        style={{ marginHorizontal: -space[3] }}
        contentContainerStyle={styles.railRow}
      >
        {items.map((item) => (
          <ItemTile key={item.id} item={item} width={RAIL_CARD_WIDTH} />
        ))}
      </ScrollView>
    </View>
  );
}

/**
 * What the shopper put aside for later, newest first, each with the way back into the cart (greyed while it is out of
 * stock) and a way to let it go. Nothing here is in the bill. It shows nothing when nothing is saved.
 */
export function SavedForLater() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const tintOf = useTintOf();
  const { saved } = useCart();
  if (saved.items.length === 0) return null;

  return (
    <View style={styles.plain}>
      <View style={styles.sectionHead}>
        <Icon name="bookmark" color={colors.accentInk} size={20} />
        <Text variant="subheading" role="heading">
          {`${t('trust.savedTitle')} \u00B7 ${saved.items.length}`}
        </Text>
      </View>
      {saved.items.map((item, index) => (
        <View key={item.id} style={[styles.row, index > 0 && styles.rowDivided]}>
          <View style={[styles.rowThumb, { backgroundColor: tintOf(item.category) }]} aria-hidden>
            <NativeText allowFontScaling={false} style={{ fontSize: 24, lineHeight: 30 }}>
              {item.emoji}
            </NativeText>
          </View>
          <View style={styles.rowText}>
            <Text variant="strong" numberOfLines={2}>
              {item.name}
            </Text>
            <Text variant="small" color="inkMuted" numberOfLines={1}>
              {item.detail}
            </Text>
            <Pressable
              role="button"
              aria-disabled={!item.available}
              disabled={!item.available}
              hitSlop={6}
              onPress={() => {
                saved.restore(item.id);
              }}
              style={({ pressed }) => [
                styles.move,
                !item.available && { opacity: 0.4 },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text variant="strong" color="accentInk">
                {item.available ? t('trust.moveToCart') : t('home.rails.outOfStock')}
              </Text>
            </Pressable>
          </View>
          <Pressable
            role="button"
            aria-label={t('trust.savedRemove')}
            hitSlop={6}
            onPress={() => {
              saved.discard(item.id);
            }}
            style={styles.discard}
          >
            <Icon name="close" color={colors.inkMuted} size={18} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

/**
 * Who packs the order: each store in the cart with its shield, its name, a "Verified" mark and its food licence number
 * (a sample, marked as one, until the real numbers are on file). In a dark-store town it is the one Quibo store.
 */
export function VerifiedShops() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { stores } = useCart();
  if (stores.length === 0) return null;
  const dark = stores.every((store) => store.id === 'quibo');

  return (
    <View style={styles.plain}>
      <View style={styles.sectionHead}>
        <Icon name="shield" color={colors.accentInk} size={20} />
        <Text variant="subheading" role="heading">
          {t(dark ? 'trust.packedAt' : 'trust.packedBy')}
        </Text>
      </View>
      {stores.map((store, index) => (
        <View key={store.id} style={[styles.row, index > 0 && styles.rowDivided]}>
          <View style={styles.shield} aria-hidden>
            <Icon name="store" color={colors.accentInk} size={18} />
          </View>
          <View style={styles.rowText}>
            <Text variant="strong" numberOfLines={1}>
              {store.name}
            </Text>
            <Text variant="small" color="inkMuted" numberOfLines={2}>
              {t('trust.licence', { number: licenceOf(store.id) })}
            </Text>
          </View>
          <Badge label={t('trust.verified')} tone="success" />
        </View>
      ))}
    </View>
  );
}

/**
 * Four short promises, each with its own picture: the price you see is the price you pay, a rider who follows your
 * instructions and hands the order over with care (there is no code to read out), an easy fix if something is wrong, and
 * one trip for everything. A fifth joins them when the cart holds a loose item sold by weight: you pay for what you get,
 * and are refunded when it comes out lighter.
 */
export function TrustPromises() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { hasWeighed } = useCart();

  return (
    <View style={styles.promises}>
      <Text variant="subheading" role="heading">
        {t('trust.title')}
      </Text>
      <TrustTiles
        tone="brand"
        tiles={[
          { key: 'price', icon: 'tag', title: t('trust.priceTitle'), body: t('trust.priceBody') },
          {
            key: 'safe',
            icon: 'shieldUser',
            title: t('trust.safeTitle'),
            body: t('trust.safeBody'),
          },
          { key: 'fix', icon: 'undo', title: t('trust.fixTitle'), body: t('trust.fixBody') },
          { key: 'trip', icon: 'bag', title: t('trust.tripTitle'), body: t('trust.tripBody') },
          ...(hasWeighed
            ? [
                {
                  key: 'weigh',
                  icon: 'receipt' as const,
                  title: t('weights.tileTitle'),
                  body: t('weights.tileBody'),
                },
              ]
            : []),
        ]}
      />
    </View>
  );
}
