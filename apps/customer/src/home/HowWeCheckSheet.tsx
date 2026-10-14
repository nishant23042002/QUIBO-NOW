import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Sheet, Text, radius, space } from '@/ui';

const NUMBER = 34;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    step: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3] },
    number: {
      width: NUMBER,
      height: NUMBER,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.lilac,
    },
    words: { flex: 1, gap: 2 },
  });

const STEPS = [
  { title: 'home.how.oneTitle', body: 'home.how.oneBody' },
  { title: 'home.how.twoTitle', body: 'home.how.twoBody' },
  { title: 'home.how.threeTitle', body: 'home.how.threeBody' },
  { title: 'home.how.fourTitle', body: 'home.how.fourBody' },
] as const;

/**
 * "How we check a shop" (ADR 0054): the four steps behind "Visited shops only" and the Quibo promise, as a sheet. Opened from the
 * strip's chip and from the promise's button.
 */
export function HowWeCheckSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);

  return (
    <Sheet open={open} onClose={onClose} title={t('home.how.title')} closeLabel={t('common.close')}>
      {STEPS.map((step, position) => (
        <View key={step.title} style={styles.step}>
          <View style={styles.number} aria-hidden>
            <Text variant="label">{position + 1}</Text>
          </View>
          <View style={styles.words}>
            <Text variant="label">{t(step.title)}</Text>
            <Text color="inkMuted">{t(step.body)}</Text>
          </View>
        </View>
      ))}
      <Text variant="fine" color="inkMuted">
        {t('home.how.note')}
      </Text>
    </Sheet>
  );
}
