import { useState } from 'react';
import { Text as NativeText, Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import {
  BOTTOM_BAR_HEIGHT,
  Button,
  Input,
  PlumCard,
  TabHeader,
  Text,
  radius,
  space,
  useChromeReport,
} from '@/ui';
import { useAddresses } from './AddressProvider';
import {
  PINCODE_LENGTH,
  SERVED_TOWNS,
  cleanPincode,
  isPincode,
  pincodeIn,
  pincodeNotifyId,
  townNotifyId,
  type ServedTown,
} from './areaRules';
import { useAreaStatus } from './useAreaStatus';
import { useNotify } from './useNotify';
import { useSampleShops } from './sampleShops';
import { useTabHeaderProps } from './useTabHeader';

const BADGE = 64;
const TILE = 44;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    page: { gap: space[5], paddingHorizontal: space[4], paddingTop: space[3] },
    route: { height: BADGE + space[2], justifyContent: 'center' },
    dots: {
      position: 'absolute',
      left: BADGE / 2,
      right: BADGE / 2,
      borderTopWidth: 3,
      borderStyle: 'dotted',
      borderColor: c.onPlumMuted,
    },
    badge: {
      position: 'absolute',
      width: BADGE,
      height: BADGE,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    from: {
      left: 0,
      backgroundColor: c.accent,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderColor: c.accentEdge,
    },
    to: { right: 0, borderWidth: 2, borderStyle: 'dashed', borderColor: c.onPlumMuted },
    cross: {
      alignSelf: 'center',
      width: 36,
      height: 36,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.tagBg,
    },
    words: { gap: space[1] },
    card: {
      padding: space[4],
      gap: space[3],
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    section: { gap: space[3] },
    town: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      padding: space[3],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    townTile: {
      width: TILE,
      height: TILE,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // A town tile's colour, named as the theme token it uses (see `ServedTown.tint`).
    accentSubtle: { backgroundColor: c.accentSubtle },
    tintStaples: { backgroundColor: c.tintStaples },
    tintVegetables: { backgroundColor: c.tintVegetables },
    townWords: { flex: 1, minWidth: 0 },
    pill: {
      minHeight: 32,
      justifyContent: 'center',
      paddingHorizontal: space[3],
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: c.ctl,
    },
    pillLive: { backgroundColor: c.accent, borderColor: c.accent },
    pillOn: { backgroundColor: c.accentSubtle, borderColor: c.accentSubtle },
    pressed: { opacity: 0.85 },
  });

/** One town on the "Where we deliver today" list: Roha opens the shops, the others take a Notify me. */
function TownRow({ town, onOpen }: { town: ServedTown; onOpen: () => void }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const notify = useNotify();
  const shops = useSampleShops();
  const name = t(`outOfArea.town.${town.id}`);
  const id = townNotifyId(town.id);
  const on = notify.has(id);
  const sub = town.live
    ? t('outOfArea.townLive', { count: shops.length })
    : t('outOfArea.townSoon');
  const pill = town.live
    ? t('outOfArea.pillLive')
    : on
      ? t('catalogue.notify.on')
      : t('catalogue.notify.me');

  return (
    <Pressable
      role="button"
      aria-label={`${name}. ${sub}. ${pill}`}
      aria-pressed={town.live ? undefined : on}
      onPress={() => {
        if (town.live) onOpen();
        else notify.toggle(id);
      }}
      style={({ pressed }) => [styles.town, pressed && styles.pressed]}
    >
      <View style={styles.townTile} aria-hidden>
        <TownTile town={town} />
      </View>
      <View style={styles.townWords}>
        <Text variant="label">{name}</Text>
        <Text variant="small" color="inkMuted">
          {sub}
        </Text>
      </View>
      <View style={[styles.pill, town.live && styles.pillLive, !town.live && on && styles.pillOn]}>
        <Text variant="caption" color={town.live ? 'onAccent' : on ? 'accentInk' : 'ink'}>
          {pill}
        </Text>
      </View>
    </Pressable>
  );
}

/** The town's tile: its emoji on its own colour (the colour is a theme token, so it follows both themes). */
function TownTile({ town }: { town: ServedTown }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={[styles.townTile, styles[town.tint]]}>
      <NativeText allowFontScaling={false} style={{ fontSize: 24, lineHeight: 30 }}>
        {town.emoji}
      </NativeText>
    </View>
  );
}

/**
 * "Out of the area" (ADR 0055, step 10): Home when the chosen address is somewhere the town does not deliver to. It says so plainly,
 * lets the shopper leave a pincode to be told when Quibo arrives, shows where Quibo is today (Roha) and where shops are signing up,
 * and offers "Look around Roha anyway", which shows the shops with ordering paused. Under the header the other tabs wear, with the
 * delivery estimate replaced by "Not here yet", so no minutes are promised to an address that cannot be reached.
 */
export function OutOfArea() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const header = useTabHeaderProps();
  const reportScroll = useChromeReport();
  const { selected } = useAddresses();
  const area = useAreaStatus();
  const notify = useNotify();
  // The address text often carries a pincode already; start from it so the shopper only has to confirm.
  const [pincode, setPincode] = useState(() =>
    selected === undefined
      ? ''
      : (pincodeIn(`${selected.house} ${selected.street} ${selected.landmark}`) ?? ''),
  );
  const valid = isPincode(pincode);
  const noted = valid && notify.has(pincodeNotifyId(pincode));
  const error = pincode.length === PINCODE_LENGTH && !valid ? t('outOfArea.pincodeBad') : undefined;

  return (
    <TabHeader
      {...header}
      deliveryLabel={t('outOfArea.headerLabel')}
      deliveryValue={t('outOfArea.headerValue')}
      onScrollY={reportScroll}
      bottomSpace={BOTTOM_BAR_HEIGHT}
    >
      <View style={styles.page}>
        <PlumCard>
          <View style={styles.route} aria-hidden>
            <View style={styles.dots} />
            <View style={[styles.badge, styles.from]}>
              <NativeText allowFontScaling={false} style={{ fontSize: 30, lineHeight: 38 }}>
                {'\u{1F3EA}'}
              </NativeText>
            </View>
            <View style={styles.cross}>
              <Text variant="label" color="tagFg">
                {'✕'}
              </Text>
            </View>
            <View style={[styles.badge, styles.to]}>
              <NativeText allowFontScaling={false} style={{ fontSize: 30, lineHeight: 38 }}>
                {'\u{1F4CD}'}
              </NativeText>
            </View>
          </View>
          <View style={styles.words}>
            <Text variant="hero" color="onPlum" role="heading">
              {t('outOfArea.title')}
            </Text>
            <Text color="onPlumMuted">{t('outOfArea.body')}</Text>
          </View>
        </PlumCard>

        <View style={styles.card}>
          <View style={styles.words}>
            <Text variant="subheading" role="heading">
              {t('outOfArea.tellTitle')}
            </Text>
            <Text variant="small" color="inkMuted">
              {noted ? t('outOfArea.notedLine', { pincode }) : t('outOfArea.tellBody')}
            </Text>
          </View>
          <Input
            label={t('outOfArea.pincodeLabel')}
            value={pincode}
            onChangeText={(text) => {
              setPincode(cleanPincode(text));
            }}
            error={error}
            keyboardType="number-pad"
            autoComplete="postal-code"
            textContentType="postalCode"
            maxLength={PINCODE_LENGTH}
            returnKeyType="done"
          />
          <Button
            label={noted ? t('outOfArea.noted') : t('catalogue.notify.me')}
            variant={noted ? 'accent' : 'primary'}
            disabled={!valid || noted}
            onPress={() => {
              notify.toggle(pincodeNotifyId(pincode));
            }}
          />
        </View>

        <View style={styles.section}>
          <Text variant="subheading" role="heading">
            {t('outOfArea.townsTitle')}
          </Text>
          {SERVED_TOWNS.map((town) => (
            <TownRow key={town.id} town={town} onOpen={area.lookAround} />
          ))}
        </View>

        <Button label={t('outOfArea.browse')} variant="secondary" onPress={area.lookAround} />
      </View>
    </TabHeader>
  );
}
