import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { BOTTOM_BAR_HEIGHT, Button, Chip, Input, MockMap, Notice, Text, space } from '@/ui';
import { useAddresses } from './AddressProvider';
import {
  ADDRESS_LABELS,
  EMPTY_DRAFT,
  MAP_BOUNDS,
  MOCK_ZONES,
  TOWN_CENTRE,
  validateAddress,
  type AddressDraft,
  type AddressField,
  type AddressProblem,
  type LatLng,
} from './addresses';
import { useAddressLabel } from './deliveryInfo';
import { formatPhone } from './phone';

const makeStyles = (_c: ThemeColors) =>
  StyleSheet.create({
    content: { gap: space[4], paddingHorizontal: space[3], paddingTop: space[4] },
    group: { gap: space[2] },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
    mapHead: { gap: space[1] },
    mapLinks: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[3] },
  });

/**
 * Adding or changing an address: what to call it, the house, street, ward and a landmark, another number to reach someone, and
 * a pin on the map. The pin must be inside the delivery area. Nothing is checked until the shopper tries to save, except the pin,
 * which is checked as soon as it is placed because it is the one thing they cannot tell by looking at the field.
 */
export function AddressEditView({ id }: { id?: string | undefined }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const labelText = useAddressLabel();
  const { addresses, add, update } = useAddresses();
  const existing = addresses.find((address) => address.id === id);

  const [draft, setDraft] = useState<AddressDraft>(
    existing === undefined
      ? EMPTY_DRAFT
      : {
          label: existing.label,
          house: existing.house,
          street: existing.street,
          landmark: existing.landmark,
          ward: existing.ward,
          phone: existing.phone,
          pin: existing.pin,
        },
  );
  const [tried, setTried] = useState(false);

  const problems = validateAddress(draft);
  // What is shown: every problem once saving has been tried, and the pin's as soon as it is placed.
  const shown = (field: AddressField): AddressProblem | undefined =>
    tried || (field === 'pin' && draft.pin !== null) ? problems[field] : undefined;
  const message = (field: AddressField): string | undefined => {
    const problem = shown(field);
    if (problem === undefined) return undefined;
    if (problem === 'phone') return t('address.badPhone');
    if (problem === 'outside') return t('address.pinOutside');
    return field === 'pin' ? t('address.pinMissing') : t('address.required');
  };

  const set = <K extends keyof AddressDraft>(key: K, value: AddressDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const place = (pin: LatLng) => {
    set('pin', pin);
  };

  const save = () => {
    setTried(true);
    if (Object.keys(problems).length > 0) return;
    const clean: AddressDraft = {
      ...draft,
      house: draft.house.trim(),
      street: draft.street.trim(),
      landmark: draft.landmark.trim(),
      ward: draft.ward.trim(),
      phone: draft.phone.trim() === '' ? '' : formatPhone(draft.phone),
    };
    if (existing === undefined) add(clean);
    else update(existing.id, clean);
    if (router.canGoBack()) router.back();
    else router.replace('/address');
  };

  const outside = problems.pin === 'outside' && draft.pin !== null;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + space[6] },
      ]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.group} role="radiogroup" aria-label={t('address.saveAs')}>
        <Text variant="label">{t('address.saveAs')}</Text>
        <View style={styles.chips}>
          {ADDRESS_LABELS.map((label) => (
            <Chip
              key={label}
              label={labelText(label)}
              selected={draft.label === label}
              onPress={() => {
                set('label', label);
              }}
            />
          ))}
        </View>
      </View>
      <Input
        label={t('address.house')}
        hint={t('address.houseHint')}
        value={draft.house}
        onChangeText={(text) => {
          set('house', text);
        }}
        error={message('house')}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <Input
        label={t('address.street')}
        value={draft.street}
        onChangeText={(text) => {
          set('street', text);
        }}
        error={message('street')}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <Input
        label={t('address.ward')}
        value={draft.ward}
        onChangeText={(text) => {
          set('ward', text);
        }}
        error={message('ward')}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <Input
        label={t('address.landmark')}
        hint={t('address.landmarkHint')}
        value={draft.landmark}
        onChangeText={(text) => {
          set('landmark', text);
        }}
        autoCapitalize="sentences"
        returnKeyType="next"
      />
      <Input
        label={t('address.phone')}
        hint={t('address.phoneHint')}
        value={draft.phone}
        onChangeText={(text) => {
          set('phone', text.replace(/[^\d+ -]/g, ''));
        }}
        error={message('phone')}
        keyboardType="phone-pad"
        maxLength={16}
        returnKeyType="done"
      />
      <View style={styles.group}>
        <View style={styles.mapHead}>
          <Text variant="label">{t('address.mapTitle')}</Text>
          <Text variant="small" color="inkMuted">
            {t('address.mapHint')}
          </Text>
        </View>
        <MockMap
          bounds={MAP_BOUNDS}
          zones={MOCK_ZONES}
          pin={draft.pin}
          pinOutside={outside}
          onPick={place}
          label={t('address.mapLabel', {
            state: draft.pin === null ? t('address.pinNotSet') : t('address.pinSet'),
          })}
        />
        <View style={styles.mapLinks}>
          <Chip
            label={t('address.useCentre')}
            icon="pin"
            onPress={() => {
              place(TOWN_CENTRE);
            }}
          />
        </View>
        {outside ? (
          <Notice tone="warning" icon="info" message={t('address.pinOutside')} />
        ) : message('pin') !== undefined ? (
          <Text variant="strong" color="danger" role="alert">
            {message('pin')}
          </Text>
        ) : null}
      </View>
      <Button label={t('address.save')} onPress={save} />
    </ScrollView>
  );
}
