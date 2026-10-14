import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useStyles, useTheme, type ThemeColors } from '@/theme';
import { Icon, Text, TAP_MIN, radius, space } from '@/ui';

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      marginHorizontal: space[4],
      minHeight: TAP_MIN + space[2],
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[3],
      paddingHorizontal: space[4],
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.lilac,
    },
    words: { flex: 1, minWidth: 0 },
    pressed: { opacity: 0.85 },
  });

/** A quiet row near the end of Home that opens Help: the way to reach a person when something is not clear. */
export function HelpRow() {
  const { t } = useLanguage();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);

  return (
    <Pressable
      role="link"
      aria-label={t('home.help.row')}
      onPress={() => {
        router.push('/help');
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Icon name="info" color={colors.action} size={22} />
      <View style={styles.words}>
        <Text variant="strong" numberOfLines={2}>
          {t('home.help.row')}
        </Text>
      </View>
      <Icon name="chevronRight" color={colors.inkMuted} size={18} />
    </Pressable>
  );
}
