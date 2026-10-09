import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text as NativeText, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  Icon,
  LoadGate,
  QTile,
  Sheet,
  SlotPicker,
  Text,
  radius,
  space,
  useLargeText,
  useScreenLoad,
  type SlotGroupData,
} from '@/ui';
import { armQuietCartReturn } from './cartReturn';
import { useCart } from './CartProvider';
import { useTintOf } from './categories';
import { useConditions } from './conditions';
import { SAMPLE_DISTANCE_KM } from './delivery';
import { deliveryFee } from './deliveryFee';
import { STEP_LOAD_MS, STEP_POLICY } from './loading';
import { ScheduleSkeleton } from './ScheduleSkeleton';
import { useSlotText } from './slotText';
import {
  choiceFor,
  earliestSlot,
  resolveChoice,
  slotsFor,
  type SlotChoice,
  type SlotDay,
  type SlotGroup,
} from './slots';

/** The confirm bar's least height: a line of small print, the button, and the space around them. It grows with large text. */
const DOCK = 124;
const GROUPS: readonly SlotGroup[] = ['morning', 'afternoon', 'evening'];
const GROUP_ICON = { morning: 'sun', afternoon: 'sun', evening: 'moon' } as const;
const THUMB = 36;
const SHOWN = 4;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    order: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: space[3],
      padding: space[4],
    },
    thumbs: { flexDirection: 'row' },
    thumb: {
      width: THUMB,
      height: THUMB,
      borderRadius: radius.full,
      borderWidth: 2,
      borderColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Takes what is left, but not less than a readable word: with large text "View items" drops under it.
    orderText: { flexGrow: 1, flexShrink: 1, flexBasis: 80, minWidth: 0 },
    link: { minHeight: 36, justifyContent: 'center' },
    options: { flexDirection: 'row', gap: space[3] },
    // With large text the two choices are stacked, each as wide as the page, instead of squeezed side by side.
    optionsStacked: { flexDirection: 'column' },
    // Side by side, the two choices share the width equally.
    optionHalf: { flex: 1 },
    option: {
      minHeight: 88,
      padding: space[3],
      borderWidth: 1.5,
      borderRadius: radius.lg,
      borderColor: c.ctl,
      backgroundColor: c.surface,
    },
    optionOn: { borderColor: c.action, backgroundColor: c.accentSubtle },
    optionOff: { opacity: 0.55, borderColor: c.line },
    // The text on the left, and the icon centred on the right, so the icon never depends on how many lines the title takes.
    optionRow: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: space[2] },
    optionText: { flex: 1, minWidth: 0, gap: space[1] },
    // The calendar gets a tile the size of the Q tile on the other card, so the two cards match.
    optionIcon: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    pressed: { opacity: 0.85 },
    quickNote: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], padding: space[4] },
    quickNoteText: { flex: 1, minWidth: 0, gap: space[1] },
    picker: { paddingHorizontal: space[4], paddingBottom: space[4] },
    hint: { paddingHorizontal: space[4], paddingTop: space[3] },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    itemThumb: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemText: { flex: 1, minWidth: 0 },
    dock: {
      position: 'absolute',
      left: 0,
      right: 0,
      minHeight: DOCK,
      paddingVertical: space[3],
      gap: space[2],
      justifyContent: 'center',
      paddingHorizontal: space[4],
      borderTopWidth: 1,
      borderTopColor: c.line,
      backgroundColor: c.surface,
    },
  });

/**
 * The page where the shopper picks how the order arrives. Quick delivery, packed and sent right away with an estimate
 * in minutes, is the default; "Schedule delivery" lets them pick a one-hour window today or tomorrow instead. It is one
 * order with one delivery. Windows that are too soon to pack are gone, full ones are shown but cannot be picked, and each
 * option says what delivery costs then, so a quieter time that costs less is easy to see. Nothing changes until
 * "Confirm"; then the cart shows the new time and bill.
 */
function SchedulePage() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const cart = useCart();
  const tintOf = useTintOf();
  const conditions = useConditions();
  const text = useSlotText();
  const large = useLargeText();
  const { now, eta, quickOpen } = cart.delivery;
  const room = insets.bottom + BOTTOM_BAR_HEIGHT;

  // What is picked here, until it is confirmed.
  const [draft, setDraft] = useState<SlotChoice>(cart.delivery.choice);
  const resolved = resolveChoice(draft, now);
  const [day, setDay] = useState<SlotDay>(resolved?.kind === 'slot' ? resolved.slot.day : 'today');
  const [itemsOpen, setItemsOpen] = useState(false);
  // How tall the confirm bar really is, so the page's end clears it at any text size.
  const [dockHeight, setDockHeight] = useState(DOCK);

  const earliest = earliestSlot(now);
  const todaySlots = slotsFor('today', now);
  const tomorrowSlots = slotsFor('tomorrow', now);
  const daySlots = day === 'today' ? todaySlots : tomorrowSlots;
  const quick = resolved?.kind === 'quick';

  // What delivery costs at each hour: nothing shown when delivery is free anyway.
  const free = cart.bill.delivery.free;
  const feeAt = (hour: number) =>
    deliveryFee({
      distanceKm: SAMPLE_DISTANCE_KM,
      hour,
      festival: conditions.festival,
      rain: conditions.rain,
      rush: conditions.rush,
    }).fee;
  const open = [...todaySlots, ...tomorrowSlots]
    .filter((slot) => !slot.full)
    .map((slot) => feeAt(slot.hour));
  const lowest = Math.min(...open);
  const varies = !free && open.length > 0 && lowest < Math.max(...open);

  const groups: SlotGroupData[] = GROUPS.map((group) => ({
    key: group,
    label: t(
      group === 'morning'
        ? 'cart.groupMorning'
        : group === 'afternoon'
          ? 'cart.groupAfternoon'
          : 'cart.groupEvening',
    ),
    icon: GROUP_ICON[group],
    slots: daySlots
      .filter((slot) => slot.group === group)
      .map((slot) => {
        const fee = feeAt(slot.hour);
        return {
          id: slot.id,
          label: text.chipLabel(slot.hour),
          ...(free || slot.full
            ? {}
            : {
                caption: formatRupees(fee),
                captionTone: varies && fee === lowest ? ('good' as const) : ('normal' as const),
              }),
          state: slot.full
            ? ('full' as const)
            : resolved?.kind === 'slot' && resolved.slot.id === slot.id
              ? ('selected' as const)
              : ('idle' as const),
        };
      }),
  })).filter((group) => group.slots.length > 0);

  const pick = (id: string) => {
    const slot = [...todaySlots, ...tomorrowSlots].find((candidate) => candidate.id === id);
    if (slot !== undefined) setDraft(choiceFor(slot));
  };

  const confirm = () => {
    cart.delivery.setChoice(draft);
    armQuietCartReturn();
    if (router.canGoBack()) router.back();
    else router.replace('/cart');
  };

  const thumbs = cart.lines.slice(0, SHOWN);
  const quickFee = free ? undefined : formatRupees(feeAt(now.getHours()));

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: room + dockHeight + space[6] }]}
        showsVerticalScrollIndicator={false}
      >
        {cart.count > 0 ? (
          <View style={[styles.card, styles.order]}>
            <View style={styles.thumbs} aria-hidden>
              {thumbs.map((line, index) => (
                <View
                  key={line.id}
                  style={[
                    styles.thumb,
                    {
                      backgroundColor: tintOf(line.category),
                      marginLeft: index === 0 ? 0 : -space[2],
                    },
                  ]}
                >
                  <NativeText allowFontScaling={false} style={{ fontSize: 18, lineHeight: 24 }}>
                    {line.emoji}
                  </NativeText>
                </View>
              ))}
            </View>
            <View style={styles.orderText}>
              <Text variant="strong">{cart.itemsLabel}</Text>
            </View>
            <Pressable
              role="link"
              hitSlop={6}
              onPress={() => {
                setItemsOpen(true);
              }}
              style={styles.link}
            >
              <Text variant="strong" color="accentInk">
                {t('cart.viewItems')}
              </Text>
            </Pressable>
          </View>
        ) : null}
        <View style={[styles.options, large && styles.optionsStacked]} role="radiogroup">
          <Pressable
            role="radio"
            aria-checked={quick}
            aria-disabled={!quickOpen}
            disabled={!quickOpen}
            onPress={() => {
              setDraft({ mode: 'quick' });
            }}
            style={({ pressed }) => [
              styles.option,
              !large && styles.optionHalf,
              quick && styles.optionOn,
              !quickOpen && styles.optionOff,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.optionRow}>
              <View style={styles.optionText}>
                <Text variant="label" numberOfLines={2}>
                  {t('cart.quickCard')}
                </Text>
                <Text variant="small" color="inkMuted" numberOfLines={2}>
                  {quickOpen
                    ? t('cart.quickSub', { from: eta.from, to: eta.to })
                    : t('cart.quickClosed')}
                </Text>
              </View>
              <View aria-hidden>
                <QTile size={36} label={t('app.name')} />
              </View>
            </View>
          </Pressable>
          <Pressable
            role="radio"
            aria-checked={!quick}
            onPress={() => {
              if (!quick) return;
              if (earliest !== undefined) {
                setDraft(choiceFor(earliest));
                setDay(earliest.day);
              }
            }}
            style={({ pressed }) => [
              styles.option,
              !large && styles.optionHalf,
              !quick && styles.optionOn,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.optionRow}>
              <View style={styles.optionText}>
                <Text variant="label" numberOfLines={2}>
                  {t('cart.scheduleCard')}
                </Text>
                <Text variant="small" color="inkMuted" numberOfLines={2}>
                  {resolved?.kind === 'slot'
                    ? text.dayWindow(resolved.slot)
                    : t('cart.scheduleSub')}
                </Text>
              </View>
              <View style={styles.optionIcon} aria-hidden>
                <Icon name="calendar" color={colors.accentInk} size={20} />
              </View>
            </View>
          </Pressable>
        </View>
        {quick ? (
          <View style={[styles.card, styles.quickNote]}>
            <Icon name="info" color={colors.inkMuted} size={20} />
            <View style={styles.quickNoteText}>
              <Text variant="small" color="inkMuted">
                {t('cart.quickNote', { from: eta.from, to: eta.to })}
              </Text>
              {quickFee !== undefined ? (
                <Text variant="strong">{t('cart.feeLine', { amount: quickFee })}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            {varies ? (
              <View style={styles.hint}>
                <Text variant="small" color="inkMuted">
                  {t('cart.quieter')}
                </Text>
              </View>
            ) : null}
            <View style={styles.picker}>
              <SlotPicker
                days={[
                  {
                    key: 'today',
                    label: text.dayLabel('today'),
                    sub: `${text.dateLabel(now)} · ${t('cart.slotsCount', { count: todaySlots.length })}`,
                  },
                  {
                    key: 'tomorrow',
                    label: text.dayLabel('tomorrow'),
                    sub: `${text.dateLabel(tomorrowSlots[0]?.date ?? now)} · ${t('cart.slotsCount', { count: tomorrowSlots.length })}`,
                  },
                ]}
                activeDay={day}
                onDay={(key) => {
                  setDay(key === 'tomorrow' ? 'tomorrow' : 'today');
                }}
                groups={groups}
                onSelect={pick}
                fullLabel={t('cart.full')}
                emptyLabel={t('cart.noSlotsToday')}
              />
            </View>
          </View>
        )}
      </ScrollView>
      <View
        style={[styles.dock, { bottom: room }]}
        onLayout={(event) => {
          setDockHeight(Math.round(event.nativeEvent.layout.height));
        }}
      >
        <Text variant="small" color="inkMuted" align="center">
          {t('cart.cancelNote')}
        </Text>
        <Button
          label={
            resolved === undefined
              ? t('cart.scheduleTitle')
              : resolved.kind === 'quick'
                ? t('cart.confirmQuick')
                : t('cart.confirm', { when: text.dayWindow(resolved.slot) })
          }
          disabled={resolved === undefined}
          shine
          shineKey={
            resolved === undefined ? '' : resolved.kind === 'quick' ? 'quick' : resolved.slot.id
          }
          onPress={confirm}
        />
      </View>
      <Sheet
        open={itemsOpen}
        onClose={() => {
          setItemsOpen(false);
        }}
        title={t('cart.yourItems')}
        closeLabel={t('common.close')}
      >
        {cart.items.map((line) => (
          <View key={line.id} style={styles.itemRow}>
            <View
              style={[styles.itemThumb, { backgroundColor: tintOf(line.category) }]}
              aria-hidden
            >
              <NativeText allowFontScaling={false} style={{ fontSize: 24, lineHeight: 30 }}>
                {line.emoji}
              </NativeText>
            </View>
            <View style={styles.itemText}>
              <Text variant="strong" numberOfLines={2}>
                {line.name}
              </Text>
              <Text variant="small" color="inkMuted" numberOfLines={1}>
                {line.quantityLine}
              </Text>
            </View>
          </View>
        ))}
      </Sheet>
    </View>
  );
}

/** The delivery-time page as it opens: its skeleton, in the shape of the choice made now, then the page fading in over it. */
export function ScheduleView() {
  const cart = useCart();
  const insets = useSafeAreaInsets();
  const load = useScreenLoad({
    loadMs: STEP_LOAD_MS,
    policy: STEP_POLICY,
    hold: !cart.ready,
  });

  return (
    <LoadGate
      load={load}
      skeleton={
        <ScheduleSkeleton
          items={cart.count > 0}
          mode={cart.delivery.choice.mode === 'slot' ? 'slot' : 'quick'}
          fee={!cart.bill.delivery.free}
          bottom={insets.bottom + BOTTOM_BAR_HEIGHT}
        />
      }
    >
      <SchedulePage />
    </LoadGate>
  );
}
