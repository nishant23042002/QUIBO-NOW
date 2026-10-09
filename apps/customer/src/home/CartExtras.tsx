import { formatRupees, money } from '@quibo/contracts';
import type { MessageKey } from '@quibo/i18n';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Text as NativeText,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  Button,
  Chip,
  Icon,
  Input,
  PopOnChange,
  Segmented,
  Text,
  radius,
  space,
  useReduceMotion,
  type IconName,
} from '@/ui';
import { useCart } from './CartProvider';
import { INSTRUCTIONS, NOTE_MAX, type InstructionKey } from './instructions';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { useHomeItems } from './items';
import { suggestItems } from './suggestions';
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
