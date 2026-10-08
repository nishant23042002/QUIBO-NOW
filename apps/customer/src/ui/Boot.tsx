import { StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, type ThemeColors } from '@/theme';
import { LogoStacked } from './brand/Logo';
import { Text } from './Text';
import { space } from './tokens';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.chrome,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[5],
      padding: space[8],
    },
  });

/** Shown for a moment while the saved theme and language are read: logo A and the tagline. */
export function Boot() {
  const styles = useStyles(makeStyles);
  const { t } = useLanguage();

  return (
    <View style={styles.root}>
      <LogoStacked width={220} label={t('app.name')} />
      <Text color="onChromeMuted">{t('app.tagline')}</Text>
    </View>
  );
}
