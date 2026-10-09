import { formatRupees, money } from '@quibo/contracts';
import type { MessageKey } from '@quibo/i18n';
import { useState } from 'react';
import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Button, Chip, Input, PopOnChange, Segmented, Text, radius, space } from '@/ui';
import { useCart } from './CartProvider';
import { INSTRUCTIONS, NOTE_MAX, type InstructionKey } from './instructions';
import { ItemTile, RAIL_CARD_WIDTH } from './ItemTile';
import { useHomeItems } from './items';
import { suggestItems } from './suggestions';
import { isPreset, parseTip } from './tip';

const INSTRUCTION_TEXT: Readonly<Record<InstructionKey, MessageKey>> = {
  leaveAtDoor: 'extras.leaveAtDoor',
  noBell: 'extras.noBell',
  callOnArrival: 'extras.callOnArrival',
  pets: 'extras.pets',
};

/** The rider on a scooter, a stand-in for an illustration until the brand has one. */
const RIDER = '\u{1F6F5}';

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
    rail: { gap: space[3] },
    railRow: { flexDirection: 'row', gap: space[3], paddingHorizontal: space[3] },
  });

/**
 * One card with two views, chosen by a small switch. "Tip": a few ready-made amounts and "Other", nothing chosen to begin
 * with; tapping the chosen one again, or "Remove tip", takes it away, and a thank-you line says where it goes (all of it to the
 * rider). "Instructions": quick choices for the rider (leave at the door, don't ring the bell, call on arrival, beware of
 * pets) and a short note, which are kept on the phone for next time.
 */
export function TipAndNotes() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { tip, instructions } = useCart();
  const [view, setView] = useState<'tip' | 'notes'>('tip');
  const [customOpen, setCustomOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | undefined>();

  const custom = tip.amount > 0 && !isPreset(tip.amount, tip.options);
  const maxLabel = formatRupees(tip.max);

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

  return (
    <View style={styles.card}>
      <Segmented
        options={[
          { key: 'tip', label: t('extras.tabTip') },
          { key: 'notes', label: t('extras.tabNotes') },
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
          <View style={styles.introText}>
            <Text variant="label">{t('extras.notesTitle')}</Text>
            <Text variant="small" color="inkMuted">
              {t('extras.notesBody')}
            </Text>
          </View>
          <View style={styles.chips}>
            {INSTRUCTIONS.map((key) => (
              <Chip
                key={key}
                label={t(INSTRUCTION_TEXT[key])}
                selected={instructions.chips.includes(key)}
                {...(instructions.chips.includes(key) ? { icon: 'check' as const } : {})}
                onPress={() => {
                  instructions.toggle(key);
                }}
              />
            ))}
          </View>
          <Input
            label={t('extras.noteLabel')}
            placeholder={t('extras.notePlaceholder')}
            hint={t('extras.noteCount', { count: instructions.note.length, max: NOTE_MAX })}
            value={instructions.note}
            onChangeText={instructions.setNote}
            maxLength={NOTE_MAX}
            returnKeyType="done"
          />
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
