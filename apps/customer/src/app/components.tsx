import { formatRupees, money } from '@quibo/contracts';
import { handleMockRequest } from '@quibo/mocks';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Badge, Button, Card, Input, Screen, Sheet, Text, space } from '@/ui';

/*
 * Every building block in every state, for developers and testers. The names above each example
 * ("primary", "loading") are code names and are not translated; everything a customer could read
 * comes from a message key, so switching language here tests real Hindi and Marathi text.
 */

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
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [sheet, setSheet] = useState<SheetDemo | null>(null);

  const action = t('components.sampleAction');
  const badge = t('components.sampleBadge');
  const loading = t('common.loading');

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

const styles = StyleSheet.create({
  section: { gap: space[4] },
  demo: { gap: space[2] },
});
