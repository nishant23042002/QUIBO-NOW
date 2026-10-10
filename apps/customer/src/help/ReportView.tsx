import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SETTINGS_LOAD_MS, SETTINGS_POLICY } from '@/home/loading';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useOnline } from '@/network';
import { orderNumber } from '@/orders/ids';
import { ItemThumb, ThumbRow, quantityLineOf } from '@/orders/ItemThumb';
import { useOrders } from '@/orders/OrdersProvider';
import { lastEventAt } from '@/orders/split';
import { headlineOf } from '@/orders/tracking';
import { useDateTimeLabel } from '@/orders/useTime';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  Icon,
  Input,
  LoadGate,
  Notice,
  OptionGroup,
  SkeletonLine,
  SkeletonScope,
  StatePanel,
  Text,
  radius,
  space,
  useScreenLoad,
} from '@/ui';
import {
  EMPTY_DRAFT,
  NOTE_MAX,
  PROBLEM_KINDS,
  asksForItems,
  canSend,
  clampNote,
  toggleItem,
  type Draft,
  type ProblemKind,
} from './report';
import { useReports } from './ReportsProvider';

/** Sending takes a moment, as it will with a server. */
const SEND_MS = 800;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      gap: space[3],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    orderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderWidth: 1.5,
      borderRadius: radius.md,
      borderColor: c.line,
    },
    orderOn: { borderColor: c.action },
    grow: { flex: 1, minWidth: 0 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 56 },
    box: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: c.ctl,
    },
    boxOn: { backgroundColor: c.action, borderColor: c.action },
    sent: { flex: 1, minHeight: 360 },
    skeleton: { flex: 1, overflow: 'hidden' },
  });

function ReportSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={styles.card}>
            <SkeletonLine size="base" width="40%" />
            <SkeletonLine size="sm" width="70%" />
            <SkeletonLine size="sm" width="55%" />
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}

function ReportPage({ orderId }: { orderId: string | undefined }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const online = useOnline();
  const dateTime = useDateTimeLabel();
  const { orders } = useOrders();
  const reports = useReports();

  const [draft, setDraft] = useState<Draft>(() => ({
    ...EMPTY_DRAFT,
    // The most common problem to begin with: a thing that did not come.
    kind: 'missing',
    // The order the shopper came from, or the only one there is.
    orderId:
      orderId !== undefined && orders.some((tracked) => tracked.order.id === orderId)
        ? orderId
        : orders.length === 1
          ? (orders[0]?.order.id ?? null)
          : null,
  }));
  const [choosing, setChoosing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (orders.length === 0) {
    return (
      <View style={styles.page}>
        <StatePanel
          icon="receipt"
          title={t('help.report.noOrdersTitle')}
          body={t('help.report.noOrdersBody')}
          actionLabel={t('help.report.back')}
          onAction={() => {
            router.back();
          }}
        />
      </View>
    );
  }

  if (sent) {
    return (
      <View style={styles.page}>
        <StatePanel
          icon="check"
          title={t('help.report.sentTitle')}
          body={t('help.report.sentBody')}
          actionLabel={t('help.report.done')}
          onAction={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/help');
          }}
        />
      </View>
    );
  }

  const chosen = orders.find((tracked) => tracked.order.id === draft.orderId);
  const showItems = draft.kind !== null && asksForItems(draft.kind);

  const send = () => {
    if (!canSend(draft) || sending || !online) return;
    setSending(true);
    setTimeout(() => {
      reports.submit(draft);
      setSending(false);
      setSent(true);
    }, SEND_MS);
  };

  const orderLine = (tracked: (typeof orders)[number], selected: boolean, onPress: () => void) => {
    const { order } = tracked;
    return (
      <Pressable
        key={order.id}
        role="radio"
        aria-checked={selected}
        onPress={onPress}
        style={({ pressed }) => [
          styles.orderRow,
          selected && styles.orderOn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <ThumbRow items={order.items} fit={3} size={32} ring={colors.surface} />
        <View style={styles.grow}>
          <Text variant="label">{t('orders.card', { number: orderNumber(order.id) })}</Text>
          <Text variant="fine" color="inkMuted">
            {`${t(`tracking.headline.${headlineOf(order)}`)} · ${dateTime(lastEventAt(order))}`}
          </Text>
        </View>
        <Text variant="strong">{formatRupees(order.total)}</Text>
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + space[6] },
      ]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      {online ? null : <Notice tone="info" icon="wifiOff" message={t('help.report.offline')} />}

      <View style={styles.card}>
        <Text variant="subheading" role="heading">
          {t('help.report.whichOrder')}
        </Text>
        <View role="radiogroup" aria-label={t('help.report.whichOrder')} style={{ gap: space[2] }}>
          {chosen !== undefined && !choosing
            ? orderLine(chosen, true, () => {
                setChoosing(true);
              })
            : orders.map((tracked) =>
                orderLine(tracked, tracked.order.id === draft.orderId, () => {
                  setDraft({ ...draft, orderId: tracked.order.id, itemIds: [] });
                  setChoosing(false);
                }),
              )}
        </View>
        {chosen !== undefined && !choosing ? (
          <Text variant="small" color="accentInk">
            {t('help.report.change')}
          </Text>
        ) : null}
      </View>

      <OptionGroup<ProblemKind>
        title={t('help.report.whatWrong')}
        options={PROBLEM_KINDS.map((kind) => ({
          value: kind,
          label: t(`help.report.kind.${kind}`),
        }))}
        value={draft.kind ?? 'missing'}
        onChange={(kind) => {
          setDraft({ ...draft, kind });
        }}
      />

      {showItems && chosen !== undefined ? (
        <View style={styles.card}>
          <Text variant="subheading" role="heading">
            {t('help.report.whichItems')}
          </Text>
          {chosen.order.items.map((item) => {
            const on = draft.itemIds.includes(item.packId);
            return (
              <Pressable
                key={item.packId}
                role="checkbox"
                aria-checked={on}
                onPress={() => {
                  setDraft({ ...draft, itemIds: toggleItem(draft.itemIds, item.packId) });
                }}
                style={styles.itemRow}
              >
                <View style={[styles.box, on && styles.boxOn]} aria-hidden>
                  {on ? <Icon name="check" color={colors.onAction} size={14} /> : null}
                </View>
                <ItemThumb emoji={item.emoji} category={item.category} />
                <View style={styles.grow}>
                  <Text numberOfLines={2}>{item.name}</Text>
                  <Text variant="fine" color="inkMuted">
                    {quantityLineOf(item, t('weights.kg'))}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Input
        label={t('help.report.noteLabel')}
        hint={t('help.report.noteHint', { max: NOTE_MAX })}
        value={draft.note}
        onChangeText={(text) => {
          setDraft({ ...draft, note: clampNote(text) });
        }}
        multiline
        maxLength={NOTE_MAX}
      />

      <Button
        label={sending ? t('help.report.sending') : t('help.report.send')}
        loading={sending}
        disabled={!canSend(draft) || !online}
        onPress={send}
      />
    </ScrollView>
  );
}

/** Report a problem with an order: which order, what went wrong, which things, and a note. It is kept with the order. */
export function ReportView({ orderId }: { orderId?: string | undefined }) {
  const orders = useOrders();
  const reports = useReports();
  const load = useScreenLoad({
    loadMs: SETTINGS_LOAD_MS,
    policy: SETTINGS_POLICY,
    hold: !orders.loaded || !reports.loaded,
  });
  return (
    <LoadGate load={load} skeleton={<ReportSkeleton />}>
      <ReportPage orderId={orderId} />
    </LoadGate>
  );
}
