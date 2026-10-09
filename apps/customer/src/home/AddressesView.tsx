import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Badge,
  Button,
  Icon,
  LoadGate,
  SkeletonLine,
  SkeletonScope,
  Skeleton,
  StatePanel,
  Text,
  radius,
  space,
  useScreenLoad,
} from '@/ui';
import { useAddresses } from './AddressProvider';
import { addressDetail, formatAddress, isServiceable, type SavedAddress } from './addresses';
import { useAddressLabel } from './deliveryInfo';
import { SETTINGS_LOAD_MS, SETTINGS_POLICY } from './loading';

/** The pin's size on a card. */
const PIN = 22;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: c.bg },
    content: { gap: space[3], paddingHorizontal: space[3], paddingTop: space[3] },
    card: {
      overflow: 'hidden',
      gap: space[3],
      padding: space[4],
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    chosen: { borderColor: c.action, backgroundColor: c.accentSubtle },
    top: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
    text: { flex: 1, minWidth: 0, gap: space[1] },
    nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2] },
    // Under the text, not under the pin: indented by the pin's width and the gap after it.
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: space[4],
      marginLeft: PIN + space[3],
    },
    list: { gap: space[3] },
    link: { minHeight: 36, justifyContent: 'center' },
    ask: { gap: space[2] },
    askButtons: { flexDirection: 'row', gap: space[3] },
    grow: { flex: 1 },
  });

/** A saved address: its name, where it is, and a way to choose it, change it or remove it. */
function AddressCard({
  address,
  chosen,
  onChoose,
  onEdit,
  onRemove,
}: {
  address: SavedAddress;
  chosen: boolean;
  onChoose: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const labelText = useAddressLabel();
  const [asking, setAsking] = useState(false);
  const served = address.pin !== null && isServiceable(address.pin);
  const detail = addressDetail(address);

  return (
    <View style={[styles.card, chosen && styles.chosen]}>
      <Pressable
        role="radio"
        aria-checked={chosen}
        aria-disabled={!served}
        aria-label={`${formatAddress(address, labelText(address.label))}. ${
          served
            ? chosen
              ? t('address.deliveringHere')
              : t('address.deliverHere')
            : t('address.notServed')
        }`}
        disabled={!served}
        onPress={onChoose}
        style={styles.top}
      >
        <Icon name="pin" color={served ? colors.accentInk : colors.inkMuted} size={PIN} />
        <View style={styles.text}>
          <View style={styles.nameRow}>
            <Text variant="label">{labelText(address.label)}</Text>
            {chosen ? <Badge label={t('address.deliveringHere')} tone="success" /> : null}
            {!served ? <Badge label={t('address.notServed')} tone="warning" /> : null}
          </View>
          <Text variant="small">
            {[address.house.trim(), address.street.trim()].filter((part) => part !== '').join(', ')}
          </Text>
          {detail !== '' ? (
            <Text variant="small" color="inkMuted">
              {detail}
            </Text>
          ) : null}
        </View>
      </Pressable>
      {asking ? (
        <View style={styles.ask}>
          <Text variant="strong">{t('address.deleteAsk')}</Text>
          <View style={styles.askButtons}>
            <View style={styles.grow}>
              <Button label={t('address.deleteYes')} variant="secondary" onPress={onRemove} />
            </View>
            <View style={styles.grow}>
              <Button
                label={t('address.deleteNo')}
                onPress={() => {
                  setAsking(false);
                }}
              />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable
            role="button"
            aria-label={`${t('address.edit')}: ${labelText(address.label)}`}
            hitSlop={8}
            onPress={onEdit}
            style={styles.link}
          >
            <Text variant="strong" color="accentInk">
              {t('address.edit')}
            </Text>
          </Pressable>
          <Pressable
            role="button"
            aria-label={`${t('address.delete')}: ${labelText(address.label)}`}
            hitSlop={8}
            onPress={() => {
              setAsking(true);
            }}
            style={styles.link}
          >
            <Text variant="strong" color="danger">
              {t('address.delete')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/** Two cards' worth of grey blocks in the shape of the list. */
function AddressesSkeleton() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  return (
    <SkeletonScope label={t('common.loading')} style={{ flex: 1, overflow: 'hidden' }}>
      <View style={styles.content}>
        {[0, 1].map((index) => (
          <View key={index} style={styles.card}>
            <View style={styles.top}>
              <Skeleton width={PIN} height={PIN} rounded={radius.full} />
              <View style={styles.text}>
                <SkeletonLine size="base" width="30%" />
                <SkeletonLine size="sm" width="75%" />
                <SkeletonLine size="sm" width="45%" />
              </View>
            </View>
            <View style={styles.actions}>
              <SkeletonLine size="sm" width={48} />
              <SkeletonLine size="sm" width={56} />
            </View>
          </View>
        ))}
        <Skeleton height={48} rounded={radius.md} />
      </View>
    </SkeletonScope>
  );
}

function AddressesPage() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addresses, selected, select, remove } = useAddresses();

  const add = () => {
    router.push('/address-edit');
  };

  if (addresses.length === 0) {
    return (
      <View style={styles.page}>
        <StatePanel
          icon="pin"
          title={t('address.emptyTitle')}
          body={t('address.emptyBody')}
          actionLabel={t('address.add')}
          onAction={add}
        />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + space[6] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View role="radiogroup" aria-label={t('address.title')} style={styles.list}>
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              chosen={selected?.id === address.id}
              onChoose={() => {
                select(address.id);
                if (router.canGoBack()) router.back();
              }}
              onEdit={() => {
                router.push({ pathname: '/address-edit', params: { id: address.id } });
              }}
              onRemove={() => {
                remove(address.id);
              }}
            />
          ))}
        </View>
        <Button label={t('address.add')} variant="secondary" onPress={add} />
      </ScrollView>
    </View>
  );
}

/**
 * The saved addresses. Tapping one chooses it as where the order goes and goes back, so Home, the product page and the cart
 * all follow at once; an address outside the delivery area is shown but cannot be chosen. Each can be changed or removed (the
 * removal asks once, in place), and a new one is added with the button under the list. With none saved it says so.
 */
export function AddressesView() {
  const { loaded } = useAddresses();
  const load = useScreenLoad({
    loadMs: SETTINGS_LOAD_MS,
    policy: SETTINGS_POLICY,
    hold: !loaded,
  });

  return (
    <LoadGate load={load} skeleton={<AddressesSkeleton />}>
      <AddressesPage />
    </LoadGate>
  );
}
