import { formatRupees } from '@quibo/contracts';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ZONE } from '@/home/delivery';
import { SETTINGS_LOAD_MS, SETTINGS_POLICY } from '@/home/loading';
import { twelveHour } from '@/home/slots';
import { useLanguage } from '@/i18n/LanguageProvider';
import { orderNumber } from '@/orders/ids';
import { useOrders } from '@/orders/OrdersProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  Icon,
  LoadGate,
  Skeleton,
  SkeletonLine,
  SkeletonScope,
  Text,
  radius,
  space,
  useScreenLoad,
} from '@/ui';
import { telLink, whatsAppLink } from './contact';
import { useReports } from './ReportsProvider';

/** The questions shown, in order. Their words are in the message files under `help.faq`. */
const FAQ = ['time', 'cancel', 'refund', 'cash', 'stock', 'area'] as const;

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
    block: { gap: space[3], padding: space[4] },
    buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
    button: { flexGrow: 1, flexBasis: 140 },
    entry: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4] },
    entryIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: c.accentSubtle,
    },
    grow: { flex: 1, minWidth: 0 },
    question: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[3],
      paddingHorizontal: space[4],
      paddingVertical: space[3],
    },
    answer: { paddingHorizontal: space[4], paddingBottom: space[4] },
    divided: { borderTopWidth: 1, borderTopColor: c.line },
    report: { gap: space[1], padding: space[4] },
    skeleton: { flex: 1, overflow: 'hidden' },
  });

function HelpSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  return (
    <SkeletonScope label={t('common.loading')} style={styles.skeleton}>
      <View style={styles.content}>
        <View style={[styles.card, styles.block]}>
          <SkeletonLine size="base" width="45%" />
          <SkeletonLine size="sm" width="55%" />
          <View style={styles.buttons}>
            <View style={styles.button}>
              <Skeleton height={48} rounded={radius.md} />
            </View>
            <View style={styles.button}>
              <Skeleton height={48} rounded={radius.md} />
            </View>
          </View>
        </View>
        <View style={[styles.card, styles.entry]}>
          <Skeleton width={40} height={40} rounded={radius.md} />
          <View style={styles.grow}>
            <SkeletonLine size="base" width="70%" />
            <SkeletonLine size="sm" width="50%" />
          </View>
        </View>
        {[0, 1, 2, 3].map((index) => (
          <View key={index} style={[styles.card, styles.question]}>
            <SkeletonLine size="base" width="60%" />
          </View>
        ))}
      </View>
    </SkeletonScope>
  );
}

function HelpPage({ orderId }: { orderId: string | undefined }) {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { find } = useOrders();
  const { reports } = useReports();
  const [open, setOpen] = useState<(typeof FAQ)[number] | null>(null);

  const { support } = ZONE;
  const tracked = orderId === undefined ? undefined : find(orderId);
  const hour = (value: number) =>
    `${twelveHour(value)} ${t(value < 12 ? 'cart.chipAm' : 'cart.chipPm')}`;
  const message =
    tracked === undefined
      ? t('help.whatsappHello')
      : t('help.whatsappOrder', { number: orderNumber(tracked.order.id) });

  const openLink = (url: string) => {
    void Linking.openURL(url).catch(() => undefined);
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + space[6] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, styles.block]}>
        <View>
          <Text variant="subheading" role="heading">
            {t('help.talkTitle')}
          </Text>
          <Text variant="small" color="inkMuted">
            {t('help.hours', { from: hour(support.fromHour), to: hour(support.toHour) })}
          </Text>
        </View>
        <View style={styles.buttons}>
          <View style={styles.button}>
            <Button
              label={t('help.call')}
              onPress={() => {
                openLink(telLink(support.phone));
              }}
            />
          </View>
          <View style={styles.button}>
            <Button
              label={t('help.whatsapp')}
              variant="secondary"
              onPress={() => {
                openLink(whatsAppLink(support.whatsapp, message));
              }}
            />
          </View>
        </View>
      </View>

      <Pressable
        role="link"
        onPress={() => {
          router.push({
            pathname: '/report',
            params: orderId === undefined ? {} : { orderId },
          });
        }}
        style={({ pressed }) => [styles.card, styles.entry, pressed && { opacity: 0.85 }]}
      >
        <View style={styles.entryIcon} aria-hidden>
          <Icon name="info" color={colors.accentInk} size={22} />
        </View>
        <View style={styles.grow}>
          <Text variant="label">{t('help.reportTitle')}</Text>
          <Text variant="small" color="inkMuted">
            {t('help.reportSub')}
          </Text>
        </View>
        <Icon name="chevronRight" color={colors.inkMuted} size={18} />
      </Pressable>

      <Text variant="strong" color="inkMuted" role="heading">
        {t('help.questionsTitle')}
      </Text>
      <View style={styles.card}>
        {FAQ.map((key, index) => {
          const expanded = open === key;
          return (
            <View key={key} style={index > 0 ? styles.divided : undefined}>
              <Pressable
                role="button"
                aria-expanded={expanded}
                onPress={() => {
                  setOpen(expanded ? null : key);
                }}
                style={({ pressed }) => [styles.question, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.grow}>
                  <Text variant={expanded ? 'label' : 'body'}>{t(`help.faq.${key}.q`)}</Text>
                </View>
                <Icon name={expanded ? 'minus' : 'plus'} color={colors.accentInk} size={20} />
              </Pressable>
              {expanded ? (
                <View style={styles.answer}>
                  <Text color="inkMuted">
                    {t(`help.faq.${key}.a`, {
                      max: formatRupees(ZONE.payment.codMaxNewCustomer),
                    })}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      {reports.length > 0 ? (
        <>
          <Text variant="strong" color="inkMuted" role="heading">
            {t('help.yourReports')}
          </Text>
          <View style={styles.card}>
            {reports.map((report, index) => (
              <View key={report.id} style={[styles.report, index > 0 && styles.divided]}>
                <Text variant="label">
                  {`${orderNumber(report.orderId)} · ${t(`help.report.kind.${report.kind}`)}`}
                </Text>
                <Text variant="small" color="inkMuted">
                  {t('help.received')}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

/** The Help screen: a person to talk to, a way to report a problem with an order, and the common questions. */
export function HelpView({ orderId }: { orderId?: string | undefined }) {
  const orders = useOrders();
  const reports = useReports();
  const load = useScreenLoad({
    loadMs: SETTINGS_LOAD_MS,
    policy: SETTINGS_POLICY,
    hold: !orders.loaded || !reports.loaded,
  });
  return (
    <LoadGate load={load} skeleton={<HelpSkeleton />}>
      <HelpPage orderId={orderId} />
    </LoadGate>
  );
}
