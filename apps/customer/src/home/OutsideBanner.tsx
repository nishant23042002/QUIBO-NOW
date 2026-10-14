import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { Button, Notice, space } from '@/ui';
import { useAreaStatus } from './useAreaStatus';

const makeStyles = (_c: ThemeColors) =>
  StyleSheet.create({ wrap: { marginHorizontal: space[4], gap: space[2] } });

/**
 * Shown at the top of Home while the shopper is looking around Roha from an address outside the delivery area (ADR 0055, step 10).
 * It says ordering is paused and goes back to the out-of-area screen, where a pincode can be left. Nothing when the address is served.
 */
export function OutsideBanner() {
  const { t } = useLanguage();
  const styles = useStyles(makeStyles);
  const area = useAreaStatus();
  if (!area.outside || !area.browsing) return null;

  return (
    <View style={styles.wrap}>
      <Notice tone="warning" icon="info" message={t('outOfArea.browsing')} />
      <Button label={t('outOfArea.tellTitle')} variant="secondary" onPress={area.backToNotice} />
    </View>
  );
}
