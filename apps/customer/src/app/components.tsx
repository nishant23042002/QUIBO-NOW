import { formatRupees, money, type Money } from '@quibo/contracts';
import { messages, translate, type MessageKey } from '@quibo/i18n';
import { handleMockRequest } from '@quibo/mocks';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import {
  AddressPill,
  Badge,
  BillSummary,
  Button,
  Card,
  CartBar,
  CategoryTile,
  Chip,
  COUNT_RULE,
  Icon,
  IconButton,
  Input,
  ItemCard,
  LogoCompact,
  LogoStacked,
  Notice,
  Price,
  ProductImage,
  QMark,
  radius,
  Screen,
  SearchBar,
  Sheet,
  ShopCard,
  space,
  Stepper,
  Text,
  WEIGHT_RULE,
  WindowPicker,
  type DeliveryWindowOption,
  type IconName,
} from '@/ui';

/*
 * Every building block in every state, for developers and testers. The names above each example
 * ("primary", "loading") are code names and are not translated; everything a customer could read
 * comes from a message key, so switching language here tests real Hindi and Marathi text. Switch
 * the theme with the button in the header to check both looks.
 */

const noop = (): void => undefined;

const ICONS: readonly IconName[] = [
  'search',
  'pin',
  'chevron',
  'back',
  'check',
  'close',
  'clock',
  'sun',
  'moon',
  'plus',
  'minus',
  'bag',
  'wifiOff',
];

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    chrome: {
      gap: space[3],
      padding: space[3],
      borderRadius: radius.md,
      backgroundColor: c.chrome,
    },
    icon: {
      width: 72,
      alignItems: 'center',
      gap: space[1],
      paddingVertical: space[2],
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
  });

function Section({ name, children }: { name: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="heading">{name}</Text>
      {children}
    </View>
  );
}

function Demo({ name, children }: { name: string; children: ReactNode }) {
  return (
    <View style={styles.demo}>
      <Text variant="small" color="inkMuted">
        {name}
      </Text>
      {children}
    </View>
  );
}

/** The dark header and cart-bar surface, so parts that live on it are shown on it. */
function OnChrome({ children }: { children: ReactNode }) {
  const themed = useStyles(makeStyles);
  return <View style={themed.chrome}>{children}</View>;
}

/** Run a check on this phone and report what happened instead of crashing the screen. */
function attempt(run: () => string): { ok: boolean; text: string } {
  try {
    return { ok: true, text: run() };
  } catch (error) {
    return { ok: false, text: error instanceof Error ? error.message : 'unknown error' };
  }
}

type SheetDemo = 'default' | 'error' | 'busy';

export default function ComponentsScreen() {
  const { t, locale } = useLanguage();
  const { colors } = useTheme();
  const themed = useStyles(makeStyles);
  const [phone, setPhone] = useState('');
  const [sheet, setSheet] = useState<SheetDemo | null>(null);
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState<'all' | 'offers'>('all');
  const [addQty, setAddQty] = useState(0);
  const [countQty, setCountQty] = useState(2);
  const [weightQty, setWeightQty] = useState(1.5);
  const [milkQty, setMilkQty] = useState(0);
  const [tomatoQty, setTomatoQty] = useState(1.5);
  const [windowId, setWindowId] = useState<string | null>('w3');

  const action = t('components.sampleAction');
  const badge = t('components.sampleBadge');
  const loading = t('common.loading');
  const sample = (key: Sample) => t(`components.sample.${key}`);
  // The same word in the other script, to see two scripts side by side. English shows Hindi;
  // Hindi and Marathi show English.
  const otherScript = (key: Sample) =>
    translate(messages[locale === 'en' ? 'hi' : 'en'], `components.sample.${key}`);
  const count = (n: number) =>
    t(n === 1 ? 'components.sample.itemCountOne' : 'components.sample.itemCountMany', { count: n });

  const stepperText = {
    addLabel: sample('add'),
    decreaseLabel: sample('removeOne'),
    increaseLabel: sample('addOne'),
  };
  const weightText = { ...stepperText, rule: WEIGHT_RULE, unitLabel: sample('kg') };
  const windows: DeliveryWindowOption[] = [
    { id: 'w1', label: sample('window1'), available: true },
    { id: 'w2', label: sample('window2'), available: false },
    { id: 'w3', label: sample('window3'), available: true },
    { id: 'w4', label: sample('window4'), available: true },
  ];
  const freeNeed = (remaining: Money) =>
    t('components.sample.freeNeed', { amount: formatRupees(remaining) });

  // Money is BigInt arithmetic and the mock API is plain code: both must also work on the phone's
  // JavaScript engine, which is not the one these tests ran on.
  const moneyCheck = attempt(() => formatRupees(money(12_345_650)));
  const moneyOk = moneyCheck.ok && moneyCheck.text === '₹1,23,456.50';
  const apiCheck = attempt(() => {
    const { status, body } = handleMockRequest({ method: 'GET', path: '/health' });
    return `${status} ${JSON.stringify(body)}`;
  });
  const apiOk = apiCheck.ok && apiCheck.text === '200 {"status":"ok"}';

  return (
    <Screen>
      <Text>{t('components.intro')}</Text>

      <Section name="Text">
        <Demo name="title">
          <Text variant="title">{t('home.title')}</Text>
        </Demo>
        <Demo name="heading">
          <Text variant="heading">{t('home.title')}</Text>
        </Demo>
        <Demo name="lead">
          <Text variant="lead">{t('home.subtitle')}</Text>
        </Demo>
        <Demo name="body">
          <Text>{t('home.subtitle')}</Text>
        </Demo>
        <Demo name="label">
          <Text variant="label">{t('home.title')}</Text>
        </Demo>
        <Demo name="small">
          <Text variant="small">{t('home.subtitle')}</Text>
        </Demo>
        <Demo name="strong">
          <Text variant="strong">{t('home.title')}</Text>
        </Demo>
      </Section>

      <Section name="Logo">
        <Demo name="stacked, on the page">
          <LogoStacked width={200} ground="page" label={t('app.name')} />
        </Demo>
        <Demo name="stacked, on the header colour">
          <OnChrome>
            <LogoStacked width={200} ground="chrome" label={t('app.name')} />
          </OnChrome>
        </Demo>
        <Demo name="compact (header)">
          <OnChrome>
            <LogoCompact height={36} label={t('app.name')} />
          </OnChrome>
        </Demo>
        <Demo name="Q mark, page and header colour">
          <View style={styles.row}>
            <QMark size={56} ground="page" label={t('app.name')} />
            <View style={themed.chrome}>
              <QMark size={56} ground="chrome" label={t('app.name')} />
            </View>
          </View>
        </Demo>
      </Section>

      <Section name="Icon">
        <View style={styles.wrap}>
          {ICONS.map((name) => (
            <View key={name} style={themed.icon}>
              <Icon name={name} color={colors.ink} size={24} />
              <Text variant="small" color="inkMuted" numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
        </View>
        <Demo name="IconButton, on the page and on the header colour">
          <View style={styles.row}>
            <IconButton
              icon="bag"
              label={t('components.sample.viewCart')}
              onPress={noop}
              ground="page"
            />
            <OnChrome>
              <IconButton icon="search" label={t('components.sample.search')} onPress={noop} />
            </OnChrome>
          </View>
        </Demo>
      </Section>

      <Section name="Button">
        <Demo name="primary">
          <Button label={action} />
        </Demo>
        <Demo name="secondary">
          <Button label={action} variant="secondary" />
        </Demo>
        <Demo name="ghost">
          <Button label={action} variant="ghost" />
        </Demo>
        <Demo name="accent (on the header colour only)">
          <OnChrome>
            <Button label={action} variant="accent" />
          </OnChrome>
        </Demo>
        <Demo name="large">
          <Button label={action} size="lg" />
        </Demo>
        <Demo name="loading">
          <Button label={action} loading />
        </Demo>
        <Demo name="disabled">
          <Button label={action} disabled />
        </Demo>
      </Section>

      <Section name="Input">
        <Demo name="default (type here)">
          <Input
            label={t('components.inputLabel')}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </Demo>
        <Demo name="hint">
          <Input label={t('components.inputLabel')} hint={t('components.inputHint')} />
        </Demo>
        <Demo name="error">
          <Input label={t('components.inputLabel')} error={t('components.inputError')} />
        </Demo>
        <Demo name="loading">
          <Input label={t('components.inputLabel')} loading />
        </Demo>
        <Demo name="disabled">
          <Input label={t('components.inputLabel')} disabled />
        </Demo>
      </Section>

      <Section name="Card">
        <Demo name="default">
          <Card>
            <Text>{t('home.windowNote')}</Text>
          </Card>
        </Demo>
        <Demo name="error">
          <Card tone="error">
            <Text>{t('common.error')}</Text>
            <Button label={t('common.retry')} variant="secondary" />
          </Card>
        </Demo>
        <Demo name="disabled">
          <Card disabled>
            <Text>{t('home.windowNote')}</Text>
          </Card>
        </Demo>
        <Demo name="loading">
          <Card loading loadingLabel={loading}>
            <Text>{t('home.windowNote')}</Text>
          </Card>
        </Demo>
      </Section>

      <Section name="Badge">
        <Demo name="neutral">
          <Badge label={badge} />
        </Demo>
        <Demo name="success">
          <Badge label={badge} tone="success" />
        </Demo>
        <Demo name="warning">
          <Badge label={badge} tone="warning" />
        </Demo>
        <Demo name="danger">
          <Badge label={badge} tone="danger" />
        </Demo>
        <Demo name="info">
          <Badge label={badge} tone="info" />
        </Demo>
        <Demo name="disabled">
          <Badge label={badge} disabled />
        </Demo>
        <Demo name="loading">
          <Badge label={badge} loading loadingLabel={loading} />
        </Demo>
      </Section>

      <Section name="Chip">
        <Demo name="filters (tap to select)">
          <View style={styles.row}>
            <Chip
              label={sample('chipAll')}
              selected={chip === 'all'}
              onPress={() => {
                setChip('all');
              }}
            />
            <Chip
              label={sample('chipOffers')}
              icon="check"
              selected={chip === 'offers'}
              onPress={() => {
                setChip('offers');
              }}
            />
          </View>
        </Demo>
        <Demo name="disabled, and a plain label">
          <View style={styles.row}>
            <Chip label={sample('chipAll')} disabled onPress={noop} />
            <Chip label={sample('chipOffers')} />
          </View>
        </Demo>
      </Section>

      <Section name="SearchBar">
        <Demo name="button (opens the search screen)">
          <OnChrome>
            <SearchBar placeholder={sample('search')} onPress={noop} />
          </OnChrome>
        </Demo>
        <Demo name="field (type here)">
          <OnChrome>
            <SearchBar placeholder={sample('search')} value={search} onChangeText={setSearch} />
          </OnChrome>
        </Demo>
      </Section>

      <Section name="AddressPill">
        <Demo name="on the header colour">
          <OnChrome>
            <AddressPill caption={sample('deliverTo')} address={sample('address')} onPress={noop} />
          </OnChrome>
        </Demo>
        <Demo name="on the page">
          <AddressPill
            caption={sample('deliverTo')}
            address={sample('address')}
            onPress={noop}
            ground="page"
          />
        </Demo>
      </Section>

      <Section name="Stepper">
        <Demo name="ADD (nothing in the cart)">
          <View style={styles.row}>
            <Stepper value={addQty} onChange={setAddQty} {...stepperText} />
          </View>
        </Demo>
        <Demo name="count">
          <View style={styles.row}>
            <Stepper value={countQty} onChange={setCountQty} rule={COUNT_RULE} {...stepperText} />
          </View>
        </Demo>
        <Demo name="loose weight, steps of 0.5 kg">
          <View style={styles.row}>
            <Stepper value={weightQty} onChange={setWeightQty} {...weightText} />
          </View>
        </Demo>
      </Section>

      <Section name="Price">
        <Demo name="plain">
          <Price amount={money(4900)} />
        </Demo>
        <Demo name="with the printed price">
          <Price amount={money(4900)} mrp={money(5500)} />
        </Demo>
        <Demo name="per kg">
          <Price amount={money(3200)} unitLabel={sample('kg')} />
        </Demo>
        <Demo name="large, with Indian digit grouping">
          <Price amount={money(12_345_650)} size="lg" />
        </Demo>
      </Section>

      <Section name="Notice">
        <Demo name="info">
          <Notice tone="info" icon="check" message={sample('noticeInfo')} />
        </Demo>
        <Demo name="warning (offline)">
          <Notice
            tone="warning"
            icon="wifiOff"
            message={t('common.offline')}
            actionLabel={t('common.retry')}
            onAction={noop}
          />
        </Demo>
        <Demo name="error">
          <Notice
            tone="error"
            icon="close"
            message={t('common.error')}
            actionLabel={t('common.retry')}
            onAction={noop}
          />
        </Demo>
      </Section>

      <Section name="ProductImage">
        <Demo name="placeholder until real photos are chosen">
          <View style={styles.small}>
            <ProductImage name={sample('itemMilk')} />
          </View>
        </Demo>
      </Section>

      <Section name="CategoryTile">
        <Demo name="with the same name in the other script">
          <View style={styles.small}>
            <CategoryTile
              name={sample('categoryDairy')}
              otherName={otherScript('categoryDairy')}
              onPress={noop}
            />
          </View>
        </Demo>
      </Section>

      <Section name="ShopCard">
        <Demo name="open, closed">
          <View style={styles.row}>
            <ShopCard
              name={sample('shopName')}
              type={sample('shopType')}
              statusLabel={sample('shopOpenWindow')}
              open
              onPress={noop}
            />
            <ShopCard
              name={sample('shopName')}
              type={sample('shopType')}
              statusLabel={sample('shopClosed')}
              open={false}
              onPress={noop}
            />
          </View>
        </Demo>
      </Section>

      <Section name="ItemCard">
        <Demo name="count with an offer tag, loose weight">
          <View style={styles.row}>
            <ItemCard
              name={sample('itemMilk')}
              otherName={otherScript('itemMilk')}
              pack={sample('itemMilkPack')}
              price={money(2800)}
              mrp={money(3000)}
              tagLabel={sample('offerTag')}
              quantity={milkQty}
              onQuantityChange={setMilkQty}
              stepper={stepperText}
            />
            <ItemCard
              name={sample('itemTomato')}
              otherName={otherScript('itemTomato')}
              pack={sample('itemTomatoPack')}
              price={money(3200)}
              quantity={tomatoQty}
              onQuantityChange={setTomatoQty}
              stepper={weightText}
            />
          </View>
        </Demo>
        <Demo name="out of stock">
          <View style={styles.row}>
            <ItemCard
              name={sample('itemMilk')}
              pack={sample('itemMilkPack')}
              price={money(2800)}
              unavailableLabel={sample('outOfStock')}
              quantity={0}
              onQuantityChange={noop}
              stepper={stepperText}
            />
            <View style={styles.spacer} />
          </View>
        </Demo>
      </Section>

      <Section name="WindowPicker">
        <Demo name="one window is full">
          <WindowPicker
            options={windows}
            selectedId={windowId}
            onSelect={setWindowId}
            unavailableLabel={sample('windowFull')}
            groupLabel={t('components.sheetTitle')}
          />
        </Demo>
      </Section>

      <Section name="CartBar">
        <Demo name="always on the header colour">
          <CartBar
            itemsLabel={count(3)}
            total={money(14_500)}
            shopName={sample('shopName')}
            actionLabel={sample('viewCart')}
            onPress={noop}
          />
        </Demo>
      </Section>

      <Section name="BillSummary">
        <Demo name="short of free delivery">
          <BillSummary
            rows={[
              { label: sample('billItems'), amount: money(12_000) },
              { label: sample('billDelivery'), amount: money(2500) },
            ]}
            totalLabel={sample('billTotal')}
            total={money(14_500)}
            freeDelivery={{
              basket: money(12_000),
              threshold: money(20_000),
              remainingLabel: freeNeed,
              reachedLabel: sample('freeReached'),
            }}
          />
        </Demo>
        <Demo name="free delivery reached">
          <BillSummary
            rows={[
              { label: sample('billItems'), amount: money(22_000) },
              { label: sample('billDelivery'), amount: money(0), valueLabel: sample('billFree') },
            ]}
            totalLabel={sample('billTotal')}
            total={money(22_000)}
            freeDelivery={{
              basket: money(22_000),
              threshold: money(20_000),
              remainingLabel: freeNeed,
              reachedLabel: sample('freeReached'),
            }}
          />
        </Demo>
      </Section>

      <Section name="Sheet">
        <Demo name="default">
          <Button
            label={t('components.openSheet')}
            variant="secondary"
            onPress={() => {
              setSheet('default');
            }}
          />
        </Demo>
        <Demo name="error">
          <Button
            label={t('components.openSheet')}
            variant="secondary"
            onPress={() => {
              setSheet('error');
            }}
          />
        </Demo>
        <Demo name="busy">
          <Button
            label={t('components.openSheet')}
            variant="secondary"
            onPress={() => {
              setSheet('busy');
            }}
          />
        </Demo>
      </Section>

      <Section name="On this phone">
        <Demo name="formatRupees(12345650), expected ₹1,23,456.50">
          <Card tone={moneyOk ? 'default' : 'error'}>
            <Text variant="heading">{moneyCheck.text}</Text>
            <Badge label={moneyOk ? 'ok' : 'wrong'} tone={moneyOk ? 'success' : 'danger'} />
          </Card>
        </Demo>
        <Demo name="mock api: GET /health">
          <Card tone={apiOk ? 'default' : 'error'}>
            <Text variant="heading">{apiCheck.text}</Text>
            <Badge label={apiOk ? 'ok' : 'wrong'} tone={apiOk ? 'success' : 'danger'} />
          </Card>
        </Demo>
      </Section>

      <Sheet
        open={sheet !== null}
        onClose={() => {
          setSheet(null);
        }}
        title={t('components.sheetTitle')}
        closeLabel={t('common.close')}
        footer={<Button label={action} size="lg" />}
        error={sheet === 'error' ? t('common.error') : undefined}
        busy={sheet === 'busy'}
      >
        {sheet === 'busy' ? (
          <Card loading loadingLabel={loading}>
            <Text>{t('components.sheetBody')}</Text>
          </Card>
        ) : (
          <Text>{t('components.sheetBody')}</Text>
        )}
      </Sheet>
    </Screen>
  );
}

/** The sample message keys, without their "components.sample." prefix. */
type Sample =
  Extract<MessageKey, `components.sample.${string}`> extends `components.sample.${infer K}`
    ? K
    : never;

const styles = StyleSheet.create({
  section: { gap: space[4] },
  demo: { gap: space[2] },
  row: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: space[3] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  small: { width: 112 },
  spacer: { flex: 1 },
});
